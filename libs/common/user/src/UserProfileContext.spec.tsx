import '@testing-library/jest-dom'
import { rest } from 'msw'

import { store, Provider, userApi }   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                  from '@acx-ui/types'

import { UserRbacUrlsInfo, UserUrlsInfo }            from './services'
import { BetaFeatures, CustomRoleType, UserProfile } from './types'
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

const fakedVenueList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '31331a644e454c75911467cdd6933af2'
    },
    {
      id: '9148ca1e5eeb425dae5d04af38e8e1b2'
    },
    {
      id: '4d0fe96778b7478a829bc6e7d81319e2'
    },
    {
      id: '7bdda584ada34de991a8081e4c59da89'
    },
    {
      id: '05b61055a7cf499eb153f414eb7230f4'
    }
  ]
}

const mockedBetaFeatures: BetaFeatures = {
  betaFeatures: [
    {
      id: 'BETA-DPSK3',
      enabled: true
    },
    {
      id: 'PLCY-EDGE',
      enabled: false
    },
    {
      id: 'SAMPLE',
      enabled: true
    }
  ]
}

const mockAllowedOperations = {
  allowedOperations: [
    {
      scope: ['edge.cluster-config-u'],
      uri: [
        'DELETE:/edgeSdLanServices/{id}/guestSettings/venues/{id}/edgeClusters/{id}',
        'PUT:/edgeSdLanServices/{id}/guestSettings/venues/{id}/edgeClusters/{id}'
      ]
    },
    {
      scope: ['all-c'],
      uri: [
        'POST:/api/tenant/{id}/chatbot/idtoken',
        'POST:/api/tenant/{id}/admin/mspecadmindeletevalidation',
        'POST:/admins/ValidationForMspecAdminsDeletions',
        'POST:/tenants/chatbot/idToken',
        'POST:/tenants/chatbot/idtoken',
        'POST:/admins/validationForMspecAdminsDeletions'
      ]
    }
  ]
}
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
    services.useGetBetaFeatureListQuery = jest.fn().mockImplementation(() => {
      return { data: mockedBetaFeatures }
    })
    mockServer.use(
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => { return res(ctx.json({ acx_account_tier: 'Gold' }))}),
      rest.get(UserUrlsInfo.getBetaStatus.url,(_req, res, ctx) =>
        res(ctx.status(200))),
      rest.put(UserUrlsInfo.toggleBetaStatus.url,
        (_req, res, ctx) => res(ctx.json({}))),
      rest.post(UserUrlsInfo.getVenuesList.url,
        (_req, res, ctx) => res(ctx.json(fakedVenueList))),
      rest.get(UserRbacUrlsInfo.getAccountTier.url.split('?')[0],
        (_req, res, ctx) => res(ctx.json({ acx_account_tier: 'Gold' }))
      ),
      rest.get(UserRbacUrlsInfo.getAllowedOperations.url,
        (_req, res, ctx) => res(ctx.json(mockAllowedOperations))
      )
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
      const { abacEnabled, isCustomRole, hasAllVenues } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
        <div>{`hasAllVenues:${hasAllVenues}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('isCustomRole:true')).toBeVisible()
    expect(await screen.findByText('abacEnabled:true')).toBeVisible()
    expect(await screen.findByText('hasAllVenues:true')).toBeVisible()
  })

  it('user profile abac enabled case and venue filtering case', async () => {
    services.useGetUserProfileQuery = jest.fn().mockImplementation(() => {
      const profile = {
        ...mockedUserProfile,
        scopes: ['switch-r', 'venue'],
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
      const { abacEnabled, isCustomRole, hasAllVenues } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`isCustomRole:${isCustomRole}`}</div>
        <div>{`hasAllVenues:${hasAllVenues}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(await screen.findByText('isCustomRole:true')).toBeVisible()
    expect(await screen.findByText('abacEnabled:true')).toBeVisible()
    expect(await screen.findByText('hasAllVenues:false')).toBeVisible()
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

  it('should generate venuesList correctly when abacEnabled and not hasAllVenues', async () => {
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return { data: { 'abac-policies-toggle': true, 'allowed-operations-toggle': false } }
    })
    services.useGetVenuesListQuery = jest.fn().mockImplementation(() => {
      return { data: fakedVenueList }
    })

    const TestVenuesList = (props: TestUserProfileChildComponentProps) => {
      const { venuesList, abacEnabled } = props.userProfileCtx
      return <>
        <div>{`abacEnabled:${abacEnabled}`}</div>
        <div>{`venuesList:${JSON.stringify(venuesList)}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestVenuesList}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('abacEnabled:true')).toBeVisible()
    expect(screen.queryByText(`venuesList:${JSON.stringify(
      fakedVenueList.data.map(item => item.id))}`)).toBeVisible()
  })

  it('should generate allowedOpeartions correctly when rbacOpsApiFF enabled', async () => {
    services.useFeatureFlagStatesQuery = jest.fn().mockImplementation(() => {
      return {
        data: {
          'abac-policies-toggle': true,
          'allowed-operations-toggle': false,
          'acx-ui-rbac-allow-operations-api-toggle': true
        }
      }
    })

    services.useGetAllowedOperationsQuery = jest.fn().mockImplementation(() => {
      return { data: mockAllowedOperations }
    })

    const TestOpsApiEnabled = (props: TestUserProfileChildComponentProps) => {
      const { allowedOperations, rbacOpsApiEnabled } = props.userProfileCtx
      return (
        <>
          <div>{`rbacOpsApiEnabled:${rbacOpsApiEnabled}`}</div>
          <div>{`allowedOperations:${JSON.stringify(allowedOperations)}`}</div>
        </>
      )
    }

    render(<TestUserProfile ChildComponent={TestOpsApiEnabled} />, {
      wrapper,
      route
    })
    await checkDataRendered()
    expect(screen.queryByText('rbacOpsApiEnabled:true')).toBeVisible()
  })
})

const checkDataRendered = async () => {
  expect(await screen.findByText('First Last')).toBeVisible()
}
