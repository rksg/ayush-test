import userEvent from '@testing-library/user-event'

import { useUpdateInvitationMutation }     from '@acx-ui/analytics/services'
import type { UserProfile }                from '@acx-ui/analytics/utils'
import { Provider }                        from '@acx-ui/store'
import { screen, render, waitFor, within } from '@acx-ui/test-utils'

import { AccountsDrawer } from './AccountsDrawer'

const mockedUseUpdateInvitationMutation = useUpdateInvitationMutation as jest.Mock
const mockedUpdateInvitation = jest.fn()
jest.mock('@acx-ui/analytics/services', () => ({
  ...jest.requireActual('@acx-ui/analytics/services'),
  useUpdateInvitationMutation: jest.fn()
}))
const mockedProfile = jest.fn()
const mockedNavigate = jest.fn()
jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: () => mockedProfile()
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  navigate: () => () => mockedNavigate()
}))

async function assertModalContent (props: {
  className: string
  content: string
}) {
  const dialog = await waitFor(async () => {
    // eslint-disable-next-line testing-library/no-node-access
    const dialog: HTMLElement = document.querySelector(`.${props.className}`)!
    expect(dialog).toHaveClass(props.className)
    return dialog
  })
  const scope = within(dialog)
  expect(await scope.findByText(props.content)).toBeVisible()
  return scope
}

const route = { params: { tenantId: '0012h00000NrljgAAB' } }
const profile = {
  accountId: '0015000000GlI7SAAV',
  selectedTenant: { id: '0012h00000NrljgAAB', name: 'Company 1', role: 'admin' },
  tenants: [
    { id: '0012h00000NrljgAAB', name: 'Company 2', role: 'admin' },
    { id: '0015000000GlI7SAAV', name: 'Company 3', role: 'report-only' }
  ],
  invitations: []
} as unknown as UserProfile
describe('AccountsDrawer', () => {
  it('allows switching tenant', async () => {
    render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByText('Company 1'))
    expect(await screen.findByText('Accounts')).toBeVisible()
    expect(await screen.findByText('Invitations')).toBeVisible()
    expect(await screen.findByText('No pending invitations')).toBeVisible()
    await userEvent.click(await screen.findByText('Company 2'))
    expect(await screen.findByText('Company 2')).toBeVisible()
  })
  it('closes the drawer', async () => {
    render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByText('Company 1'))
    expect(await screen.findByText('Accounts')).toBeVisible()
    expect(await screen.findByText('Invitations')).toBeVisible()
    expect(await screen.findByText('No pending invitations')).toBeVisible()
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(await screen.findByText('Company 1')).toBeVisible()
  })

  describe('Invitations', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          ...window.location,
          reload: jest.fn()
        }
      })
    })
    beforeEach(() => {
      mockedUseUpdateInvitationMutation.mockImplementation(() => [mockedUpdateInvitation])
    })
    afterEach(() => {
      mockedUseUpdateInvitationMutation.mockClear()
    })
    it('shows invitations', async () => {
      profile.invitations = [
        {
          accountName: 'abc',
          role: 'admin',
          type: 'super-tenant',
          resourceGroupId: 'rg1',
          firstName: 'f',
          lastName: 'l'
        },
        {
          accountName: 'xyz',
          role: 'network-admin',
          type: 'tenant',
          resourceGroupId: 'rg2',
          firstName: 'f1',
          lastName: 'l1'
        }
      ]
      render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
      await userEvent.click(await screen.findByText('Company 1'))
      await userEvent.click(screen.getByTestId('tenant-dropdown'))
      await userEvent.click(screen.getByTestId('invitation-count'))
      expect(await screen.findByText('Invitations')).toBeVisible()
      expect(await screen.findByText(/brand invitation\(s\)/)).toBeVisible()
      expect(await screen.findByText(/You have been invited by f1 l1/)).toBeVisible()
    })
    it('should accept and reject invitation', async () => {
      mockedUpdateInvitation.mockImplementation(() => ({
        unwrap: () => Promise.resolve('Created')
      }))
      profile.invitations = [
        {
          accountName: 'xyz',
          role: 'network-admin',
          type: 'tenant',
          resourceGroupId: 'rg2',
          firstName: 'f1',
          lastName: 'l1'
        }
      ]
      render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
      await userEvent.click(await screen.findByText('Company 1'))
      expect(await screen.findByText('Invitations')).toBeVisible()

      const tests = [{
        type: 'accept',
        success: 'Accepted invitation succesfully. Page will reload to update the user profile'
      }, {
        type: 'reject',
        success: 'Rejected invitation succesfully. Page will reload to update the user profile'
      }]
      tests.forEach(async ({ type, success }) => {
        const actionBtn = await screen.findByText(`${type}`)
        actionBtn.click()
        await assertModalContent({
          className: 'ant-modal-confirm-confirm',
          content: `Do you really want to ${type} the invitation?`
        })
        const btn = await screen.findByRole('button', { name: 'OK' })
        btn.click()
        const scope = await assertModalContent({
          className: 'ant-modal-confirm-info',
          content: success
        })
        const btn1 = await scope.findByRole('button', { name: 'OK' })
        btn1.click()
        expect(window.location.reload).toHaveBeenCalled()
      })
    })
    it('should handle error', async () => {
      mockedUpdateInvitation.mockImplementation(() => ({
        unwrap: () => Promise.reject('some error')
      }))
      profile.invitations = [
        {
          accountName: 'xyz',
          role: 'network-admin',
          type: 'tenant',
          resourceGroupId: 'rg2',
          firstName: 'f1',
          lastName: 'l1'
        }
      ]
      render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
      await userEvent.click(await screen.findByText('Company 1'))
      expect(await screen.findByText('Invitations')).toBeVisible()

      const tests = [{
        type: 'accept',
        error: 'some error'
      }, {
        type: 'reject',
        error: 'some error'
      }]
      tests.forEach(async ({ type, error }) => {
        const actionBtn = await screen.findByText(`${type}`)
        actionBtn.click()
        // await userEvent.click(await screen.findByText(`${type}`))
        await assertModalContent({
          className: 'ant-modal-confirm-confirm',
          content: `Do you really want to ${type} the invitation?`
        })
        const btn = await screen.findByRole('button', { name: 'OK' })
        btn.click()
        await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
        const scope = await assertModalContent({
          className: 'ant-modal-confirm-error',
          content: error
        })
        await userEvent.click(await scope.findByRole('button', { name: 'OK' }))
        expect(window.location.reload).not.toHaveBeenCalled()
      })
    })
  })
})
