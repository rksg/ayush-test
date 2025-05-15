/* eslint-disable max-len */
import { rest } from 'msw'

import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider  }                                from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  mockServer
} from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps, setUserProfile } from '@acx-ui/user'

import { fakeUserProfile }      from './AccountSettings/__tests__/fixtures'
import { fakeDelegationList }   from './Administrators/__tests__/fixtures'
import { fakeNotificationList } from './Notifications/__tests__/fixtures'

import Administration from '.'

const mockedUsedNavigate = jest.fn()
const mockedAdminsReqFn = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)

const fakeSupportUser = { ...fakeUserProfile, dogfood: true }
const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

jest.mock('./AccountSettings', () => () => {
  return <div data-testid='mocked-AccountSettings'></div>
})
jest.mock('./Administrators', () => () => {
  return <div data-testid='mocked-Administrators'></div>
})
jest.mock('./FWVersionMgmt', () => () => {
  return <div data-testid='mocked-FWVersionMgmt'></div>
})
jest.mock('./OnpremMigration', () => () => {
  return <div data-testid='mocked-OnpremMigration'></div>
})
jest.mock('./LocalRadiusServer', () => () => {
  return <div data-testid='mocked-LocalRadiusServer'></div>
})
jest.mock('./Notifications', () => () => {
  return <div data-testid='mocked-Notifications'></div>
})
jest.mock('./Privacy', () => () => {
  return <div data-testid='mocked-Privacy'></div>
})
jest.mock('./Subscriptions', () => () => {
  return <div data-testid='mocked-Subscriptions'></div>
})
jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object
    .keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(sets)
})
describe('Administration page', () => {
  let params: { tenantId: string, activeTab: string } =
  { tenantId: fakeUserProfile.tenantId, activeTab: 'accountSettings' }
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RADIUS_CLIENT_CONFIG)
  jest.mocked(useIsTierAllowed).mockReturnValue(true)

  beforeEach(() => {
    mockedAdminsReqFn.mockClear()
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })

    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
        (req, res, ctx) => {
          mockedAdminsReqFn()
          return res(ctx.json([
            {
              id: '0587cbeb13404f3b9943d21f9e1d1e9e',
              email: 'efg.cheng@email.com',
              role: 'PRIME_ADMIN',
              delegateToAllECs: true,
              detailLevel: 'debug'
            }
          ]))
        }
      ),
      rest.get(
        AdministrationUrlsInfo.getDelegations.url.split('?type=')[0],
        (req, res, ctx) => res(ctx.json(fakeDelegationList))
      ),
      rest.get(
        AdministrationUrlsInfo.getNotificationRecipients.url,
        (req, res, ctx) => res(ctx.json(fakeNotificationList))
      ),
      rest.post(
        AdministrationUrlsInfo.getWebhooks.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Settings' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should have correct tabs amount', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(8)
  })

  it('should have correct tabs amount for custom role', async () => {
    params.activeTab = 'fwVersionMgmt'
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ ...userProfileContextValues, isCustomRole: true }}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })
    const tab = screen.queryByRole('tab', { name: /Version Management/ })
    expect(tab).not.toBeInTheDocument()
    expect(await screen.findByTestId('mocked-FWVersionMgmt')).toBeVisible()
  })

  it('should handle tab changes', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    fireEvent.click(await screen.findByText('Notifications (3)'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/administration/notifications`,
      hash: '',
      search: ''
    })
  })

  it('should render notifications tab correctly', async () => {
    params.activeTab = 'notifications'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = await screen.findByRole('tab', { name: 'Notifications (3)' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render administrators tab correctly', async () => {
    params.activeTab = 'administrators'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = await screen.findByRole('tab', { name: 'Administrators (2)' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should not have administrators tab for abac enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params.activeTab = 'notifications'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const notificationTab = await screen.findByRole('tab', { name: 'Notifications (3)' })
    expect(notificationTab.getAttribute('aria-selected')).toBeTruthy()

    const tab = screen.queryByRole('tab', { name: /Administrators/ })
    expect(tab).not.toBeInTheDocument()
  })

  it('should not allow administrators tab access for support user', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params.activeTab = 'administrators'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ data: fakeSupportUser, isPrimeAdmin } as UserProfileContextProps}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Administrators is not allowed to access.')).toBeVisible()
  })

  it('should render subscriptions tab correctly', async () => {
    params.activeTab = 'subscriptions'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Subscriptions' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render firmware version management tab correctly', async () => {
    params.activeTab = 'fwVersionMgmt'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Version Management' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render zd migration tab correctly', async () => {
    params.activeTab = 'onpremMigration'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'ZD Migration' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render local radius server tab correctly', async () => {
    let params: { tenantId: string, activeTab: string } =
      { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', activeTab: 'localRadiusServer' }

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Local RADIUS Server' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render administrator title with count for group login disabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.GROUP_BASED_LOGIN_TOGGLE && ff !== Features.ABAC_POLICIES_TOGGLE)
    params.activeTab = 'administrators'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const adminTab = await screen.findByRole('tab', { name: 'Administrators (2)' })
    expect(adminTab.getAttribute('aria-selected')).toBeTruthy()
    const notificationTab = screen.getByRole('tab', { name: 'Notifications (3)' })
    expect(notificationTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should render administrator title without count for group login enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.GROUP_BASED_LOGIN_TOGGLE)
    params.activeTab = 'administrators'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const adminTab = await screen.findByRole('tab', { name: 'Administrators' })
    expect(adminTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should show Privacy tab selected', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params.activeTab = 'privacy'

    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Administration />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    const notificationTab = await screen.findByRole('tab', { name: 'Privacy' })
    expect(notificationTab.getAttribute('aria-selected')).toBeTruthy()
  })
})
