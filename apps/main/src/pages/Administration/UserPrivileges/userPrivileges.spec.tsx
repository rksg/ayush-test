
import { Features, useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { Provider }                                                    from '@acx-ui/store'
import { render, screen }                                              from '@acx-ui/test-utils'
import { UserProfileContext, setUserProfile, UserProfileContextProps } from '@acx-ui/user'

import { fakeUserProfile } from './__tests__/fixtures'

import UserPrivileges from './index'


const isPrimeAdmin : () => boolean = jest.fn().mockReturnValue(true)

const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps

jest.mock('@acx-ui/msp/services', () => ({
  useGetMspEcProfileQuery: jest.fn().mockReturnValue({
    data: []
  })
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetTenantDetailsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetAdminListQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetAdminListPaginatedQuery: jest.fn().mockReturnValue({
    data: { totalCount: 0, content: [] },
    isLoading: false,
    isFetching: false
  }),
  useGetAdminGroupsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetDelegationsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetPrivilegeGroupsQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetCustomRolesQuery: jest.fn().mockReturnValue({
    data: []
  }),
  useGetTenantAuthenticationsQuery: jest.fn().mockReturnValue({
    data: []
  })
}))

// 模擬子組件
jest.mock('./UsersTable', () => {
  return jest.fn(() => <div data-testid='mocked-UsersTable' />)
})

describe('UserPrivileges', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    setUserProfile({ profile: fakeUserProfile, allowedOperations: [] })
    params = { tenantId: '8c36a0a9ab9d4806b060e112205add6f' }
  })

  it('should render UsersTable', async () => {
    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    await screen.findByTestId('mocked-UsersTable')
    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should render with pagination enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.PTENANT_USERS_PRIVILEGES_FILTER_TOGGLE
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should render with group-based login enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should render with privilege groups paginated API enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.ACX_UI_USE_PAGIATED_PRIVILEGE_GROUP_API
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should handle different tenant types', async () => {
    const services = require('@acx-ui/rc/services')
    services.useGetTenantDetailsQuery.mockReturnValue({
      data: {
        tenantType: 'MSP'
      }
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should handle MSP EC profile data', async () => {
    const mspServices = require('@acx-ui/msp/services')
    mspServices.useGetMspEcProfileQuery.mockReturnValue({
      data: { isMspEc: true }
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should configure SSO when authentication data contains SAML', async () => {
    const services = require('@acx-ui/rc/services')
    services.useGetTenantAuthenticationsQuery.mockReturnValue({
      data: [
        {
          id: '1',
          authenticationType: 'SAML',
          name: 'Test SAML'
        }
      ]
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })
})
