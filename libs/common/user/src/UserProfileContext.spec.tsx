import '@testing-library/jest-dom'
import { rest } from 'msw'

import { store, Provider, userApi } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { UserUrlsInfo } from './services'
import {
  useUserProfileContext,
  UserProfileProvider
} from './UserProfileContext'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useLocaleContext: () => ({ messages: { 'en-US': { lang: 'Language' } } })
}))

const tenantId = 'a27e3eb0bd164e01ae731da8d976d3b1'

const mockedUserProfile = {
  firstName: 'First',
  lastName: 'Last',
  roles: [RolesEnum.PRIME_ADMIN]
}

function TestUserProfile () {
  const { data: userProfile, allowedOperations } = useUserProfileContext()
  return <>
    <div>{userProfile?.fullName}</div>
    <div>{JSON.stringify(allowedOperations)}</div>
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
        (req, res, ctx) => res(ctx.json(mockedUserProfile))
      ),
      rest.get(UserUrlsInfo.wifiAllowedOperations.url, (req, res, ctx) =>
        res(ctx.json(['some-operation']))),
      rest.get(UserUrlsInfo.switchAllowedOperations.url, (req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.tenantAllowedOperations.url, (req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.venueAllowedOperations.url, (req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.guestAllowedOperations.url, (req, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.upgradeAllowedOperations.url, (req, res, ctx) => res(ctx.json([])))
    )
  })

  it('requests for user profile and stores in context', async () => {
    render(<TestUserProfile />, { wrapper, route })

    expect(await screen.findByText('First Last')).toBeVisible()
    expect(await screen.findByText('["some-operation"]')).toBeVisible()
  })

  it('should be able to recognize prime admin', async () => {
    const TestPrimeAdmin = () => {
      const { isPrimeAdmin } = useUserProfileContext()
      return <div>
        {isPrimeAdmin()+''}
      </div>
    }

    render(<TestPrimeAdmin />, { wrapper, route })

    expect(await screen.findByText('true')).toBeVisible()
  })

  it('user profile hasRole()', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json({
          ...mockedUserProfile,
          roles: [RolesEnum.ADMINISTRATOR]
        }))
      )
    )

    const TestUserRole = ({ role }:{ role: RolesEnum }) => {
      const { hasRole } = useUserProfileContext()
      return <div>
        {hasRole(role)+''}
      </div>
    }

    render(<TestUserRole
      role={RolesEnum.GUEST_MANAGER}
    />, { wrapper, route })

    expect(await screen.findByText('false')).toBeVisible()
  })
})
