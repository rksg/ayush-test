import { Form } from 'antd'
import { rest } from 'msw'

import { RuckusAssistantUrlInfo }                   from '@acx-ui/rc/utils'
import { baseRuckusAssistantApi, Provider, store  } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockNetwork1Data }   from './__test__/NetworkSummaryFixtures'
import { NetworkSummaryPage } from './NetworkSummaryPage'


jest.mock('@acx-ui/rc/components', () => ({
  SummaryForm: () => <div>Network Summary Page</div>
}))


describe('NetworkSummaryPage', () => {
  const mockGetOnboardConfigsFn = jest.fn()
  beforeEach(() => {
    mockGetOnboardConfigsFn.mockReset()
    store.dispatch(baseRuckusAssistantApi.util.resetApiState())
    mockServer.use(
      rest.get(RuckusAssistantUrlInfo.getOnboardConfigs.url,
        (_, res, ctx) => {
          mockGetOnboardConfigsFn()
          return res(ctx.json(mockNetwork1Data))
        }
      )
    )
  })

  it('should display NetworkSummaryPage page correctly', async () => {
    render(
      <Provider>
        <Form>
          <NetworkSummaryPage
            summaryId={'summary-id'}
            summaryTitle={'network1 with Open Network'}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Network Summary Page')).toBeVisible()
    expect(mockGetOnboardConfigsFn).toHaveBeenCalled()
  })
})
