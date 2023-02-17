import { rest } from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
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
const params = { tenantId }

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId })
}))

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
    render(<Provider>
      <UserProfileProvider>
        <TestUserProfile/ >
      </UserProfileProvider>
    </Provider>, { route: { params } })
    expect(await screen.findByText('First Last')).toBeVisible()
  })
})
