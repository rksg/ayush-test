/* eslint-disable max-len */
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/rbac'
import { Provider  }                                   from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { fakeUserProfile } from './AccountSettings/__tests__/fixtures'

import Administration from '.'

const mockedUsedNavigate = jest.fn()
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

jest.mock('./AccountSettings', () => ({
  ...jest.requireActual('./AccountSettings'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-AccountSettings'></div>
  }
}))
jest.mock('./Administrators', () => ({
  ...jest.requireActual('./Administrators'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-Administrators'></div>
  }
}))
// jest.mock('./FWVersionMgmt', () => ({
//   ...jest.requireActual('./FWVersionMgmt'),
//   __esModule: true,
//   default: () => {
//     return <div data-testid='mocked-FWVersionMgmt'></div>
//   }
// }))
jest.mock('./LocalRadiusServer', () => ({
  ...jest.requireActual('./LocalRadiusServer'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-LocalRadiusServer'></div>
  }
}))
jest.mock('./Notifications', () => ({
  ...jest.requireActual('./Notifications'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-Notifications'></div>
  }
}))
jest.mock('./Subscriptions', () => ({
  ...jest.requireActual('./Subscriptions'),
  __esModule: true,
  default: () => {
    return <div data-testid='mocked-Subscriptions'></div>
  }
}))
describe('Administration page', () => {
  let params: { tenantId: string, activeTab: string } =
  { tenantId: fakeUserProfile.tenantId, activeTab: 'accountSettings' }
  jest.mocked(useIsSplitOn).mockReturnValue(true)

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

    const tab = screen.getByRole('tab', { name: 'Account Settings' })
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
    expect(tabs.length).toBe(6 )
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

    fireEvent.click(screen.getByText('Notifications'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/administration/notifications`,
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

    const tab = screen.getByRole('tab', { name: 'Notifications' })
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

    const tab = screen.getByRole('tab', { name: 'Administrators' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should not have administrators tab', async () => {
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

    const tab = screen.queryByRole('tab', { name: 'Administrators' })
    expect(tab).not.toBeInTheDocument()
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

    const tab = screen.getByRole('tab', { name: 'Firmware Version Management' })
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

  it('should render when only edge early beta flag enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementationOnce((flag) => {
      return flag === Features.EDGE_EARLY_BETA ? true : false
    })

    params.activeTab = 'accountSettings'

    render(
      <Provider>
        <Administration />
      </Provider>, {
        route: { params }
      })

    const tab = screen.getByRole('tab', { name: 'Account Settings' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should not render when feature flag off', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(() => false)

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
    await screen.findByText('Administration is not enabled')
  })
})
