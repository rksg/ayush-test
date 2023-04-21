import userEvent from '@testing-library/user-event'

import {
  Provider,
  videoCallQoeApi as api,
  store,
  videoCallQoeURL
} from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { createTestResponse, getAllCallQoeTests } from '../__tests__/fixtures'

import { VideoCallQoeForm } from './VideoCallQoeForm'

const { click, type } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockedNavigate
}))


describe('VideoCallQoeForm', () => {
  beforeEach(() => {
    mockedNavigate.mockReset()
    store.dispatch(api.util.resetApiState())
  })

  it('works correctly for create flow', async () => {
    render(<VideoCallQoeForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    mockGraphqlQuery(videoCallQoeURL,'CallQoeTests', {
      data: getAllCallQoeTests
    })

    expect(await screen.findByRole('heading', { name: /create test call/i })).toBeVisible()

    // Step 1
    await type(await screen.findByRole('textbox', {
      name: /test name/i
    }), 'Test 1')

    // Navigate to Step 2
    mockGraphqlMutation(videoCallQoeURL, 'CreateVideoCallQoeTest', { data: createTestResponse })
    await click(await screen.findByText(/add/i))
    expect(await screen.findByRole('heading', { name: /test details/i })).toBeVisible()

    expect((await screen.findAllByRole('link')).at(1))
      .toHaveTextContent(createTestResponse.createCallQoeTest.meetings[0].joinUrl)

    // Done
    await click(await screen.findByText(/done/i))
    expect(mockedNavigate).toBeCalled()
  })
})
