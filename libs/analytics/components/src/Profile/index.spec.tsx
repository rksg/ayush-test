import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider, store, rbacApi, rbacApiURL } from '@acx-ui/store'
import { render, screen, waitFor, mockServer }  from '@acx-ui/test-utils'

import { Profile, ProfileTabEnum } from '.'

const sampleProfile = {
  preferences: {
    preferredLanguage: 'en-US'
  },
  firstName: 'first',
  lastName: 'name',
  email: 'test123@gmail.com',
  accountId: '"0015000000Gl19SAAV"',
  selectedTenant: {
    role: 'admin'
  },
  userId: '123'
}

const mockedUsedNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => ({ state: { from: '/test' } })
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserProfile: jest.fn(() => (sampleProfile))
}))

jest.mock('./PreferredLanguageFormItem', () => ({
  PreferredLanguageFormItem: () => <div data-testid={'PreferredLanguageFormItem'}
    title='PreferredLanguageFormItem' />
}))

describe('Profile', () => {
  beforeEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })
  it('should render', async () => {
    render(<Profile />,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    expect(await screen.findByText('Settings')).toBeVisible()
  })
  it('should handle notification tab click', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Notifications'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/analytics/profile/notifications', hash: '', search: ''
    }))
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
      { pathname: '/test' }, { replace: true }))
  })
  it('should handle cancel', async () => {
    render(<Profile tab={ProfileTabEnum.SETTINGS}/>,
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
    await userEvent.click(await screen.findByText('Cancel'))
    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith(
      { pathname: '/test' }, { replace: true }))
  })
})
