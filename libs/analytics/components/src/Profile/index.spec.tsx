import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { get }                                  from '@acx-ui/config'
import { Provider, store, rbacApi, rbacApiURL } from '@acx-ui/store'
import { render, screen, waitFor, mockServer }  from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }    from '@acx-ui/user'

import { NotificationSettings } from '../NotificationSettings'


import { Profile, ProfileTabEnum } from '.'

const sampleProfile = {
  preferences: {
    preferredLanguage: 'en-US'
  },
  firstName: 'first',
  lastName: 'name',
  email: 'test123@gmail.com',
  accountId: '0015000000Gl19SAAV',
  selectedTenant: {
    role: 'admin'
  },
  userId: '123'
}

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => ({ state: { from: '/test' } }),
  useTenantLink: () => ({
    hash: '',
    pathname: '/',
    search: ''
  })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(() => (sampleProfile))
}))

jest.mock('./PreferredLanguageFormItem', () => ({
  PreferredLanguageFormItem: () => <div data-testid={'PreferredLanguageFormItem'}/>
}))

jest.mock('../NotificationSettings', () => ({
  NotificationSettings: jest.fn(() => <div data-testid={'NotificationSettings'}/>)
}))
const notification = jest.mocked(NotificationSettings)

describe('Profile', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
    mockedUsedNavigate.mockReset()
    setRaiPermissions({ READ_INCIDENTS: true } as RaiPermissions)
    jest.mocked(get).mockReturnValue('true')
  })
  it('should render with notifications', async () => {
    render(<Profile />,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Settings')).toBeVisible()
    expect(await screen.findByText('Notifications')).toBeVisible()
  })
  it('should render without notifications and tabs', async () => {
    setRaiPermissions({ READ_INCIDENTS: false } as RaiPermissions)
    render(<Profile />,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(screen.queryByText('Settings')).toBeNull()
    expect(screen.queryByText('Notifications')).toBeNull()
  })
  it('should handle tab click', async () => {
    render(<Profile tab={ProfileTabEnum.NOTIFICATIONS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Settings'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '//profile/settings', hash: '', search: ''
    })
  })
  it('should handle opening tabs in new window', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Notifications'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '//profile/notifications', hash: '', search: ''
    })
  })
  it('should handle apply', async () => {
    mockServer.use(
      rest.put(
        `${rbacApiURL}/users/${sampleProfile.userId}`,
        (_, res, ctx) => {
          return res(ctx.json(sampleProfile.preferences))
        }
      )
    )
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Apply Settings'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      { pathname: '/', hash: '', search: '' }, { replace: true }))
  })
  it('should handle save', async () => {
    notification.mockImplementation(({ apply }) => {
      apply.current = () => true
      return <div data-testid={'NotificationSettings'}/>
    })
    mockServer.use(
      rest.put(
        `${rbacApiURL}/users/${sampleProfile.userId}`,
        (_, res, ctx) => {
          return res(ctx.json(sampleProfile.preferences))
        }
      )
    )
    render(<Profile tab={ProfileTabEnum.NOTIFICATIONS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Save'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      { pathname: '/', hash: '', search: '' }, { replace: true }))
  })
  it('should handle save with error', async () => {
    notification.mockImplementation(({ apply }) => {
      apply.current = () => false
      return <div data-testid={'NotificationSettings'}/>
    })
    mockServer.use(
      rest.put(
        `${rbacApiURL}/users/${sampleProfile.userId}`,
        (_, res, ctx) => {
          return res(ctx.json(sampleProfile.preferences))
        }
      )
    )
    render(<Profile tab={ProfileTabEnum.NOTIFICATIONS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Save'))
    expect(mockedUsedNavigate).not.toHaveBeenCalled()
  })
  it('should handle cancel', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Cancel'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      { pathname: '/', hash: '', search: '' }, { replace: true }))
  })
})
