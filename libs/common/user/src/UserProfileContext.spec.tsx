import '@testing-library/jest-dom'
import { rest } from 'msw'

import { store, Provider, userApi } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen } from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { UserUrlsInfo }     from './services'
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
  const { data: userProfile, allowedOperations } = data

  return <>
    <div>{userProfile?.fullName}</div>
    <div>{JSON.stringify(allowedOperations)}</div>
    {props.ChildComponent && <props.ChildComponent userProfileCtx={data}/>}
  </>
}

const route = { path: '/:tenantId/t', params: { tenantId } }

describe('UserProfileContext', () => {
  const wrapper = (props: { children: React.ReactNode }) => (
    <Provider>
      <UserProfileProvider {...props} />
    </Provider>
  )

  beforeEach(async () => {
    store.dispatch(userApi.util.resetApiState())
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (_req, res, ctx) => res(ctx.json(mockedUserProfile))
      ),
      rest.get(UserUrlsInfo.wifiAllowedOperations.url.replace('?service=wifi', ''),
        (_req, res, ctx) => res(ctx.json(['some-operation']))),
      rest.get(UserUrlsInfo.switchAllowedOperations.url.replace('?service=switch', ''),
        (_req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.tenantAllowedOperations.url,
        (_req, res, ctx) => res(ctx.json(['tenantOps']))),
      rest.get(UserUrlsInfo.venueAllowedOperations.url,
        (_req, res, ctx) => res(ctx.json(['venueOps']))),
      rest.get(UserUrlsInfo.guestAllowedOperations.url.replace('?service=guest', ''),
        (_req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.upgradeAllowedOperations.url.replace('?service=upgradeConfig', ''),
        (_req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.getAccountTier.url as string,
        (_req, res, ctx) => { return res(ctx.json({ acx_account_tier: 'Gold' }))}),
      rest.get(UserUrlsInfo.getBetaStatus.url,(_req, res, ctx) =>
        res(ctx.status(200))),
      rest.put(UserUrlsInfo.toggleBetaStatus.url,
        (_req, res, ctx) => res(ctx.json({})))
    )
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
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (_req, res, ctx) => res(ctx.json({
          ...mockedUserProfile,
          roles: [RolesEnum.ADMINISTRATOR]
        }))
      )
    )

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

  it('user profile undefined firstName/lastName', async () => {
    const emptyNameProfile = {
      ...mockedUserProfile,
      firstName: undefined,
      lastName: undefined
    }

    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (_req, res, ctx) => res(ctx.json(emptyNameProfile))
      )
    )

    const TestUndefinedUserName = (props: TestUserProfileChildComponentProps) => {
      const { data, betaEnabled, accountTier } = props.userProfileCtx
      return <>
        <div>{`initials:${data?.initials}`}</div>
        <div>{`betaEnabled:${betaEnabled}`}</div>
        <div>{`accountTier:${accountTier}`}</div>
      </>
    }

    render(<TestUserProfile ChildComponent={TestUndefinedUserName}/>, { wrapper, route })
    expect(await screen.findByText(/some-operation/)).toBeVisible()
    expect(await screen.findByText(/venueOps/)).toBeVisible()
    expect(screen.queryByText('initials:undefined')).toBeVisible()
    expect(screen.queryByText('betaEnabled:false')).toBeVisible()
    expect(screen.queryByText('accountTier:Gold')).toBeVisible()
  })

  it('user profile beta enabled case', async () => {
    mockServer.use(
      rest.get(UserUrlsInfo.getBetaStatus.url,(_req, res, ctx) =>
        res(ctx.json({ enabled: 'true' })))
    )

    const TestBetaEnabled = (props: TestUserProfileChildComponentProps) => {
      const { betaEnabled } = props.userProfileCtx
      return <div>{`betaEnabled:${betaEnabled}`}</div>
    }

    render(<TestUserProfile ChildComponent={TestBetaEnabled}/>, { wrapper, route })
    await checkDataRendered()
    expect(screen.queryByText('betaEnabled:true')).toBeVisible()
  })
})

const checkDataRendered = async () => {
  expect(await screen.findByText('First Last')).toBeVisible()
  expect(await screen.findByText(/some-operation/)).toBeVisible()
  expect(await screen.findByText(/venueOps/)).toBeVisible()
}