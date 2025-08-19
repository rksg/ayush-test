
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

jest.mock('./SsoGroups', () => {
  return jest.fn(() => <div data-testid='mocked-SsoGroups' />)
})

jest.mock('../Administrators/DelegationsTable', () => {
  return jest.fn(() => <div data-testid='mocked-DelegationsTable' />)
})

jest.mock('./PrivilegeGroups', () => {
  return jest.fn(() => <div data-testid='mocked-PrivilegeGroups' />)
})

jest.mock('./PrivilegeGroups/NewPrivilegeGroups', () => {
  return jest.fn(() => <div data-testid='mocked-NewPrivilegeGroups' />)
})

jest.mock('./CustomRoles', () => {
  return jest.fn(() => <div data-testid='mocked-CustomRoles' />)
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

  it('should render correct admin counts with pagination enabled', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.PTENANT_USERS_PRIVILEGES_FILTER_TOGGLE ||
             ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetAdminListPaginatedQuery.mockReturnValue({
      data: {
        totalCount: 5,
        content: [
          { id: '1', email: 'user1@test.com' },
          { id: '2', email: 'user2@test.com' }
        ]
      },
      isLoading: false,
      isFetching: false
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    // Check if Users tab shows correct count
    expect(screen.getByText(/Users \(5\)/)).toBeInTheDocument()
  })

  it('should render correct admin counts with regular API', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetAdminListQuery.mockReturnValue({
      data: [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
        { id: '3', email: 'user3@test.com' }
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

    // Check if Users tab shows correct count
    expect(screen.getByText(/Users \(3\)/)).toBeInTheDocument()
  })

  it('should show SSO Groups tab when SAML is configured', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

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
    services.useGetAdminGroupsQuery.mockReturnValue({
      data: [
        { id: '1', name: 'Admin Group 1' },
        { id: '2', name: 'Admin Group 2' }
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

    expect(screen.getByText(/SSO Groups \(2\)/)).toBeInTheDocument()
  })

  it('should show Delegated Admins tab for appropriate tenant types', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetTenantDetailsQuery.mockReturnValue({
      data: { tenantType: 'REC' }
    })
    services.useGetDelegationsQuery.mockReturnValue({
      data: [
        { id: '1', delegatedToName: 'Delegate 1' },
        { id: '2', delegatedToName: 'Delegate 2' },
        { id: '3', delegatedToName: 'Delegate 3' }
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

    expect(screen.getByText(/Delegated Admins \(3\)/)).toBeInTheDocument()
  })

  it('should show Privilege Groups tab with correct count', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetPrivilegeGroupsQuery.mockReturnValue({
      data: [
        { id: '1', name: 'Privilege Group 1' },
        { id: '2', name: 'Privilege Group 2' }
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

    expect(screen.getByText(/Privilege Groups \(2\)/)).toBeInTheDocument()
  })

  it('should show Custom Roles tab with correct count', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetCustomRolesQuery.mockReturnValue({
      data: [
        { id: '1', name: 'Custom Role 1' },
        { id: '2', name: 'Custom Role 2' },
        { id: '3', name: 'Custom Role 3' },
        { id: '4', name: 'Custom Role 4' }
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

    expect(screen.getByText(/Roles \(4\)/)).toBeInTheDocument()
  })

  it('should handle MSP-EC user email correctly', async () => {
    const mspServices = require('@acx-ui/msp/services')
    mspServices.useGetMspEcProfileQuery.mockReturnValue({
      data: {
        isMspEc: true,
        mspEcTenantId: 'test-msp-ec-id'
      }
    })

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

    // The UsersTable should be rendered with empty currentUserMail for MSP-EC
    expect(screen.getByTestId('mocked-UsersTable')).toBeInTheDocument()
  })

  it('should not show delegated admins for VAR tenant type', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetTenantDetailsQuery.mockReturnValue({
      data: { tenantType: 'VAR' }
    })
    services.useGetDelegationsQuery.mockReturnValue({
      data: [{ id: '1', delegatedToName: 'Delegate 1' }]
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    // Should not show delegated admins tab for VAR
    expect(screen.queryByText(/Delegated Admins/)).not.toBeInTheDocument()
  })

  it('should not show delegated admins for MSP tenant type', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetTenantDetailsQuery.mockReturnValue({
      data: { tenantType: 'MSP' }
    })
    services.useGetDelegationsQuery.mockReturnValue({
      data: [{ id: '1', delegatedToName: 'Delegate 1' }]
    })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    // Should not show delegated admins tab for MSP
    expect(screen.queryByText(/Delegated Admins/)).not.toBeInTheDocument()
  })

  it('should not show SSO Groups tab when no SAML is configured', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetTenantAuthenticationsQuery.mockReturnValue({
      data: [
        {
          id: '1',
          authenticationType: 'LOCAL',
          name: 'Local Auth'
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

    // Should not show SSO Groups tab when no SAML
    expect(screen.queryByText(/SSO Groups/)).not.toBeInTheDocument()
  })

  it('should handle empty data gracefully', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.GROUP_BASED_LOGIN_TOGGLE
    })

    const services = require('@acx-ui/rc/services')
    services.useGetAdminListQuery.mockReturnValue({ data: [] })
    services.useGetAdminGroupsQuery.mockReturnValue({ data: [] })
    services.useGetDelegationsQuery.mockReturnValue({ data: [] })
    services.useGetPrivilegeGroupsQuery.mockReturnValue({ data: [] })
    services.useGetCustomRolesQuery.mockReturnValue({ data: [] })

    render(
      <Provider>
        <UserProfileContext.Provider value={userProfileContextValues}>
          <UserPrivileges />
        </UserProfileContext.Provider>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText(/Users \(0\)/)).toBeInTheDocument()
    expect(screen.getByText(/Privilege Groups \(0\)/)).toBeInTheDocument()
    expect(screen.getByText(/Roles \(0\)/)).toBeInTheDocument()
  })
})
