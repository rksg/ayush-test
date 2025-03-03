import userEvent from '@testing-library/user-event'

import { getUserProfile, type Tenant }                           from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { Provider }                                              from '@acx-ui/store'
import { render, screen }                                        from '@acx-ui/test-utils'
import { RaiPermissions, raiPermissionsList, setRaiPermissions } from '@acx-ui/user'

import { AccountManagement, AccountManagementTabEnum } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../Support', () => ({
  ...jest.requireActual('../Support'),
  Support: () => <div data-testid='Support' />
}))

jest.mock('../OnboardedSystems', () => ({
  ...jest.requireActual('../OnboardedSystems'),
  useOnboardedSystems: () => ({
    title: 'Onboarded Systems (0)',
    component: <div data-testid='OnboardedSystems' />
  })
}))

jest.mock('../Users', () => ({
  ...jest.requireActual('../Users'),
  useUsers: () => ({
    title: 'Users (0)',
    component: <div data-testid='Users' />
  })
}))

jest.mock('../Developers/Webhooks', () => ({
  ...jest.requireActual('../Developers/Webhooks'),
  useWebhooks: () => ({
    title: 'Webhooks (0)',
    component: <div data-testid='Webhooks' />
  })
}))

jest.mock('../Developers', () => ({
  ...jest.requireActual('../Developers'),
  useWebhooks: () => ({
    title: 'Developers',
    component: <div data-testid='Developers' />
  })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn()
}))

describe('AccountManagement', () => {
  const permissions = Object.keys(raiPermissionsList)
    .filter(v => isNaN(Number(v)))
    .reduce((permissions, name) => ({ ...permissions, [name]: true }), {}) as RaiPermissions

  beforeEach(() => {
    setRaiPermissions(permissions)
    jest.mocked(getUserProfile).mockReturnValue({
      accountId: 'accountId',
      firstName: 'firstName',
      lastName: 'lastName',
      email: '',
      userId: '',
      isSupport: false,
      invitations: [],
      selectedTenant: { id: 'accountId', permissions } as Tenant,
      tenants: [{ id: 'accountId', permissions }] as Tenant[]
    })
  })
  it('should render Developers if RUCKUS_AI_JWT_TOGGLE is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Onboarded Systems (0)')).toBeVisible()
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByText('Labels')).toBeVisible()
    expect(await screen.findByText('Resource Groups')).toBeVisible()
    expect(await screen.findByText('Support')).toBeVisible()
    expect(await screen.findByText('Licenses')).toBeVisible()
    expect(await screen.findByText('Schedules')).toBeVisible()
    expect(await screen.findByText('Developers')).toBeVisible()
  })
  it('should render Webhooks if RUCKUS_AI_JWT_TOGGLE is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Onboarded Systems (0)')).toBeVisible()
    expect(await screen.findByText('Users (0)')).toBeVisible()
    expect(await screen.findByText('Labels')).toBeVisible()
    expect(await screen.findByText('Resource Groups')).toBeVisible()
    expect(await screen.findByText('Support')).toBeVisible()
    expect(await screen.findByText('Licenses')).toBeVisible()
    expect(await screen.findByText('Schedules')).toBeVisible()
    expect(await screen.findByText('Webhooks (0)')).toBeVisible()
  })
  it('should handle tab click', async () => {
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Onboarded Systems (0)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/admin/onboarded', hash: '', search: ''
    })
  })
  it('should handle opening tabs in new window', async () => {
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Labels'))
    expect(window.open).toHaveBeenCalledWith('/analytics/admin/labels', '_blank')
  })
  it('should not open Users tab in new window if RUCKUS_AI_NEW_ROLES_TOGGLE is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<AccountManagement tab={AccountManagementTabEnum.SUPPORT}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Users (0)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/admin/users', hash: '', search: ''
    })
  })
})
