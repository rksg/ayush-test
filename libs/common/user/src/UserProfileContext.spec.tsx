import '@testing-library/jest-dom'
import { rest } from 'msw'

import { store, Provider, userApi } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen } from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { UserUrlsInfo }                from './services'
import { CustomRoleType, UserProfile } from './types'
import {
  useUserProfileContext,
  UserProfileProvider,
  UserProfileContextProps
} from './UserProfileContext'

const tenantId = 'a27e3eb0bd164e01ae731da8d976d3b1'
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => tenantId
}))
const services = require('./services')

function transformResponse (userProfile: UserProfile) {
  const { firstName, lastName } = userProfile
  userProfile.fullName = ''

  if (firstName && lastName) {
    userProfile.initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
    userProfile.fullName = `${firstName} ${lastName}`
  }
  return userProfile
}
const mockedUserProfile = {
  firstName: 'First',
  lastName: 'Last',
  roles: [RolesEnum.PRIME_ADMIN]
}

interface TestUserProfileChildComponentProps {
  userProfileCtx: UserProfileContextProps
}
function TestUserProfile (props: {
  ChildComponent?: React.FunctionComponent<TestUserProfileChildComponentProps>
}) {
  const data = useUserProfileContext()
  const { data: userProfile } = data

  return <>
    <div>{userProfile?.fullName}</div>
    {props.ChildComponent && <props.ChildComponent userProfileCtx={data}/>}
  </>
}

const route = { path: '/:tenantId/t', params: { tenantId } }

const fakedPrivilegeGroupList =
  [
    {
      id: '2765e98c7b9446e2a5bdd4720e0e8911',
      name: 'PRIME_ADMIN',
      description: 'Prime Admin Role',
      roleName: 'PRIME_ADMIN',
      type: 'System',
      delegation: false,
      allCustomers: false,
      allVenues: true
    }
  ]

describe('UserProfileContext', () => {
  const wrapper = (props: { children: React.ReactNode }) => (
    <Provider>
      <UserProfileProvider {...props} />
    </Provider>
  )

  beforeEach(async () => {
    store.dispatch(userApi.util.resetApiState())
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      return { data: transformResponse(mockedUserProfile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': false,
        'allowed-operations-toggle': false } }
    })
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: fakedPrivilegeGroupList }
    })
    mockServer.use(
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => { return res(ctx.json({ acx_account_tier: 'Gold' }))}),
      rest.get(UserUrlsInfo.getBetaStatus.url,(_req, res, ctx) =>
        res(ctx.status(200))),
      rest.put(UserUrlsInfo.toggleBetaStatus.url,
        (_req, res, ctx) => res(ctx.json({})))
    )
  })

  it('user profile undefined firstName/lastName', async () => {
    const emptyNameProfile = {
      ...mockedUserProfile,
      firstName: undefined,
      lastName: undefined
    }
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = transformResponse(emptyNameProfile as unknown as UserProfile)
      return { data: profile }
    })

    const TestUndefinedUserName = (props: TestUserProfileChildComponentProps) => {
      const { data, betaEnabled, accountTier } = props.userProfileCtx
      return <>
        <div>{`initials:${data?.initials}`}</div>
        <div>{`betaEnabled:${betaEnabled}`}</div>
        <div>{`accountTier:${accountTier}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestUndefinedUserName}/>, { wrapper, route })
    expect(await screen.findByText('accountTier:Gold')).toBeVisible()
    expect(screen.queryByText('initials:undefined')).toBeVisible()
    expect(screen.queryByText('betaEnabled:false')).toBeVisible()
  })

  it('requests for user profile and stores in context', async () => {
    render(<TestUserProfile />, { wrapper, route })
    await checkDataRendered()
  })

  it('should be able to recognize prime admin', async () => {
    const TestPrimeAdmin = (props: TestUserProfileChildComponentProps) => {
      const { isPrimeAdmin } = props.userProfileCtx
      return <div>
        {isPrimeAdmin()+''}
      </div>
    }

    render(<TestUserProfile ChildComponent={TestPrimeAdmin}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('true')).toBeVisible()
  })

  it('user profile hasRole()', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        roles: [RolesEnum.ADMINISTRATOR]
      }
      return { data: transformResponse(profile as UserProfile) }
    })

    const TestUserRole = (props: TestUserProfileChildComponentProps) => {
      const { hasRole } = props.userProfileCtx
      const role = RolesEnum.GUEST_MANAGER
      return <div>
        {hasRole(role)+''}
      </div>
    }

    render(<TestUserProfile ChildComponent={TestUserRole}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('false')).toBeVisible()
  })

  it('user profile beta enabled case', async () => {
    services.useGetBetaStatusQuery = jest.fn().mockImplementation(() => {
      return { data: { enabled: 'true' } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { betaEnabled } = props.userProfileCtx
      return <div>{`betaEnabled:${betaEnabled}`}</div>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('betaEnabled:true')).toBeVisible()
  })

  it('user profile abac enabled case', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        scopes: ['switch-r'],
        customRoleName: 'CUSTOM_USER',
        customRoleType: CustomRoleType.CUSTOM
      }
      return { data: transformResponse(profile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': true,
        'allowed-operations-toggle': false } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled, isCustomRole } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('isCustomRole:true')).toBeVisible()
    expect(screen.queryByText('abacEnabled:true')).toBeVisible()
  })

  it('user profile special abac disabled case with custom role', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        role: 'CUSTOM_ROLE',
        roles: ['CUSTOM_ROLE'],
        scopes: ['switch-r'],
        customRoleName: 'CUSTOM_USER',
        customRoleType: CustomRoleType.CUSTOM
      }
      return { data: transformResponse(profile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': false,
        'allowed-operations-toggle': false } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled, isCustomRole, accountTier } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
        <div>{`accountTier:${accountTier}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('accountTier:Gold')).toBeVisible()
    expect(screen.queryByText('isCustomRole:false')).toBeVisible()
    expect(screen.queryByText('abacEnabled:false')).toBeVisible()
  })

  it('user profile special abac disabled case with system redefined role', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        role: 'DPSK_ADMIN',
        roles: ['DPSK_ADMIN'],
        scopes: ['switch-r'],
        customRoleName: 'CUSTOM_USER',
        customRoleType: CustomRoleType.CUSTOM
      }
      return { data: transformResponse(profile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': false,
        'allowed-operations-toggle': false } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled, isCustomRole, accountTier, data } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
        <div>{`accountTier:${accountTier}`}</div>
        <div>{`role:${data?.role}`}</div>
        <div>{`roles:${data?.roles}`}</div>

      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('accountTier:Gold')).toBeVisible()
    expect(screen.queryByText('role:DPSK_ADMIN')).toBeVisible()
    expect(screen.queryByText('roles:DPSK_ADMIN')).toBeVisible()
    expect(screen.queryByText('isCustomRole:false')).toBeVisible()
    expect(screen.queryByText('abacEnabled:false')).toBeVisible()
  })

  it('user profile special abac disabled case with default role (PRIME_ADMIN)', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        role: 'PRIME_ADMIN',
        roles: ['PRIME_ADMIN'],
        scopes: ['switch-r'],
        customRoleName: 'PRIME_ADMIN',
        customRoleType: CustomRoleType.CUSTOM
      }
      return { data: transformResponse(profile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': false,
        'allowed-operations-toggle': false } }
    })
    services.useGetPrivilegeGroupsQuery = jest.fn().mockImplementation(() => {
      return { data: null }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled, isCustomRole } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('abacEnabled:false')).toBeVisible()
    expect(screen.queryByText('isCustomRole:false')).toBeVisible()
  })

  it('user profile special abac disabled case with default role (READ_ONLY)', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        role: 'READ_ONLY',
        roles: ['READ_ONLY'],
        scopes: ['switch-r'],
        customRoleName: 'READ_ONLY'
      }
      return { data: transformResponse(profile as UserProfile) }
    })
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': false,
        'allowed-operations-toggle': false } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled, isCustomRole } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('abacEnabled:false')).toBeVisible()
    expect(screen.queryByText('isCustomRole:false')).toBeVisible()
  })

  it('should handle abacEnabled value correctly', async () => {
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'allowed-operations-toggle': false } }
    })

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { abacEnabled } = props.userProfileCtx
      return <div>{`abacEnabled:${abacEnabled}`}</div>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('abacEnabled:false')).toBeVisible()
  })

})

const checkDataRendered = async () => {
  expect(await screen.findByText('First Last')).toBeVisible()
}
