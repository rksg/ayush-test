import userEvent from '@testing-library/user-event'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  Provider,
  videoCallQoeApi as api,
  store,
  r1VideoCallQoeURL
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
    mockGraphqlQuery(r1VideoCallQoeURL,'CallQoeTests', { data: getAllCallQoeTests })
  })

  it('should render breadcrumb', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<VideoCallQoeForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
  })

  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<VideoCallQoeForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(screen.queryByText('AI Assurance')).toBeNull()
    expect(screen.queryByText('Network Assurance')).toBeNull()
    expect(await screen.findByText('Video Call QoE')).toBeVisible()
  })

  it('works correctly for create flow', async () => {
    render(<VideoCallQoeForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    expect(await screen.findByRole('heading', { name: /create test call/i })).toBeVisible()

    // Step 1
    await type(await screen.findByRole('textbox', {
      name: /test call name/i
    }), 'Test 1')

    // Navigate to Step 2
    mockGraphqlMutation(r1VideoCallQoeURL, 'CreateVideoCallQoeTest', { data: createTestResponse })
    await click(await screen.findByRole('button', { name: 'Create' }))
    expect(await screen.findByRole('heading', { name: /test call details/i })).toBeVisible()

    expect((await screen.findAllByRole('link')).at(1))
      .toHaveTextContent(createTestResponse.createCallQoeTest.meetings[0].joinUrl)

    // Done
    await click(await screen.findByText(/done/i))
    expect(mockedNavigate).toBeCalled()
  })
})
