import { rest } from 'msw'

import { CommonUrlsInfo, RolesEnum } from '@acx-ui/rc/utils'
import { BrowserRouter as Router }   from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  useUserProfileContext,
  UserProfileProvider
} from '.'

const tenantId = 'a27e3eb0bd164e01ae731da8d976d3b1'

const mockedUserProfile = {
  firstName: 'First',
  lastName: 'Last',
  roles: [RolesEnum.PRIME_ADMIN]
}

function TestUserProfile () {
  const { data: userProfile } = useUserProfileContext()
  return <div>
    {userProfile?.fullName}
  </div>
}

describe('UserProfileContext', () => {
  beforeEach(async () => {
    const location = {
      ...window.location,
      pathname: `/t/${tenantId}`
    }
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })

    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json(mockedUserProfile))
      )
    )
  })

  it('requests for user profile and stores in context', async () => {
    render(<Router>
      <Provider>
        <UserProfileProvider>
          <TestUserProfile />
        </UserProfileProvider>
      </Provider>
    </Router>)

    expect(await screen.findByText('First Last')).toBeVisible()
  })

  it('should be able to recognize prime admin', async () => {
    const TestPrimeAdmin = () => {
      const { isPrimeAdmin } = useUserProfileContext()
      return <div>
        {isPrimeAdmin()+''}
      </div>
    }

    render(<Router>
      <Provider>
        <UserProfileProvider>
          <TestPrimeAdmin />
        </UserProfileProvider>
      </Provider>
    </Router>)

    expect(await screen.findByText('true')).toBeVisible()
  })

  it('user profile hasRole()', async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
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

    render(<Router>
      <Provider>
        <UserProfileProvider>
          <TestUserRole role={RolesEnum.GUEST_MANAGER} />
        </UserProfileProvider>
      </Provider>
    </Router>)

    expect(await screen.findByText('false')).toBeVisible()
  })
})
