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
      jest.clearAllMocks()
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
    it('should accept invitation', async () => {
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
      expect(true).toEqual(true)
      await userEvent.click(await screen.findByText('Company 1'))
      expect(await screen.findByText('Invitations')).toBeVisible()
      expect(true).toEqual(true)
      await userEvent.click(screen.getByText('accept'))

      await assertModalContent({
        className: 'ant-modal-confirm-confirm',
        content: 'Do you really want to accept the invitation from f1 l1, xyz?'
      })
      const btn = await screen.findByRole('button', { name: 'OK' })
      btn.click()
      const scope = await assertModalContent({
        className: 'ant-modal-confirm-info',
        content: 'Accepted invitation succesfully. Page will reload to update the user profile'
      })
      await userEvent.click(await scope.findByRole('button', { name: 'OK' }))
      expect(window.location.reload).toHaveBeenCalled()
    })
    it('should reject invitation', async () => {
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
      const actionBtn = await screen.findByText('reject')
      actionBtn.click()
      await assertModalContent({
        className: 'ant-modal-confirm-confirm',
        content: 'Do you really want to reject the invitation from f1 l1, xyz?'
      })
      const btn = screen.getByRole('button', { name: 'OK' })
      btn.click()
      const scope = await assertModalContent({
        className: 'ant-modal-confirm-info',
        content: 'Rejected invitation succesfully. Page will reload to update the user profile'
      })
      await userEvent.click(await scope.findByRole('button', { name: 'OK' }))
      expect(window.location.reload).toHaveBeenCalled()
    })
    it('should handle error', async () => {
      mockedUpdateInvitation.mockImplementation(() => ({
        unwrap: () => Promise.reject({ data: 'some error' })
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

      const actionBtn = await screen.findByText('accept')
      actionBtn.click()
      await assertModalContent({
        className: 'ant-modal-confirm-confirm',
        content: 'Do you really want to accept the invitation from f1 l1, xyz?'
      })
      const btn = await screen.findByRole('button', { name: 'OK' })
      btn.click()
      await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
      const scope = await assertModalContent({
        className: 'ant-modal-confirm-error',
        content: 'some error'
      })
      await userEvent.click(await scope.findByRole('button', { name: 'OK' }))
      expect(window.location.reload).not.toHaveBeenCalled()
    })
  })
})
