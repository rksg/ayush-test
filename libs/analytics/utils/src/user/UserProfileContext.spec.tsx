import '@testing-library/jest-dom'
import { rest } from 'msw'

import { store, Provider  } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { userApi }        from './services'
import { getUserProfile } from './userProfile'
import {
  useUserProfileContext,
  UserProfileProvider
} from './UserProfileContext'

const mockedUserProfile = {
  firstName: 'First',
  lastName: 'Last'
}

function TestUserProfile () {
  const { data: userProfile } = useUserProfileContext()
  return <div>{`${userProfile?.firstName} ${userProfile?.lastName}`}</div>
}

const route = { path: '/analytics/next' }

describe('UserProfileContext', () => {
  const wrapper = (props: { children: React.ReactNode }) => (
    <Provider>
      <UserProfileProvider {...props} />
    </Provider>
  )

  beforeEach(async () => {
    store.dispatch(userApi.util.resetApiState())
  })

  it('should return empty profile', async () => {
    mockServer.use(
      rest.get(
        '/analytics/api/rsa-mlisa-rbac/users/profile',
        (req, res, ctx) => res(ctx.json(null))
      )
    )
    render(<TestUserProfile />, { wrapper, route })

    expect(getUserProfile()).toEqual({})
  })
  it('requests for user profile and stores in context', async () => {
    mockServer.use(
      rest.get(
        '/analytics/api/rsa-mlisa-rbac/users/profile',
        (req, res, ctx) => res(ctx.json(mockedUserProfile))
      )
    )
    render(<TestUserProfile />, { wrapper, route })

    expect(await screen.findByText('First Last')).toBeVisible()
    expect(getUserProfile()).toEqual(mockedUserProfile)
  })
})
