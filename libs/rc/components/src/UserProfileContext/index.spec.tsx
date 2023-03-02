import { rest } from 'msw'

import { CommonUrlsInfo }          from '@acx-ui/rc/utils'
import { BrowserRouter as Router } from '@acx-ui/react-router-dom'
import { Provider }                from '@acx-ui/store'
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

function TestUserProfile () {
  const { data: userProfile } = useUserProfileContext()
  return <div>
    {userProfile?.fullName}
  </div>
}

describe('UserProfileContext', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getUserProfile.url,
        (req, res, ctx) => res(ctx.json({ firstName: 'First', lastName: 'Last' }))
      )
    )
  })

  it('requests for user profile and stores in context', async () => {
    const location = {
      ...window.location,
      pathname: `/t/${tenantId}`
    }
    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: location
    })

    render(<Router>
      <Provider>
        <UserProfileProvider>
          <TestUserProfile/ >
        </UserProfileProvider>
      </Provider>
    </Router>)

    expect(await screen.findByText('First Last')).toBeVisible()
  })
})
