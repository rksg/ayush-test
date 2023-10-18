import userEvent from '@testing-library/user-event'

import type { UserProfile } from '@acx-ui/analytics/utils'
import { Provider }         from '@acx-ui/store'
import { screen, render }   from '@acx-ui/test-utils'

import { AccountsDrawer } from './AccountsDrawer'

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

const route = { params: { tenantId: '0012h00000NrljgAAB' } }
const profile = {
  accountId: '0015000000GlI7SAAV',
  selectedTenant: { id: '0012h00000NrljgAAB', name: 'Company 1', role: 'admin' },
  tenants: [
    { id: '0012h00000NrljgAAB', name: 'Company 2', role: 'admin' },
    { id: '0015000000GlI7SAAV', name: 'Company 3', role: 'report-only' }
  ]
} as UserProfile
describe('AccountsDrawer', () => {
  it('allows switching tenant', async () => {
    render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByText('Company 1'))
    expect(await screen.findByText('Accounts')).toBeVisible()
    await userEvent.click(await screen.findByText('Company 2'))
    expect(await screen.findByText('Company 2')).toBeVisible()
  })
  it('closes the drawer', async () => {
    render(<AccountsDrawer user={profile} />, { wrapper: Provider, route })
    await userEvent.click(await screen.findByText('Company 1'))
    expect(await screen.findByText('Accounts')).toBeVisible()
    await userEvent.click(await screen.findByTestId('CloseSymbol'))
    expect(await screen.findByText('Company 1')).toBeVisible()
  })
})
