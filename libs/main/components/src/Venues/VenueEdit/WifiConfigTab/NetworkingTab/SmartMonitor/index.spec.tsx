import { Form } from 'antd'
import { rest } from 'msw'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { WifiRbacUrlsInfo }           from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { SmartMonitor } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

const params = {
  venueId: 'venue-id'
}

describe('SmartMonitor', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueSmartMonitor.url,
        (_, res, ctx) => res(ctx.json({ enabled: false, interval: 10, threshold: 3 })))
    )
  })

  it('should render R370 compatiblity tooltip', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_R370_TOGGLE)

    render(
      <Provider>
        <Form>
          <SmartMonitor />
        </Form>
      </Provider>, {
        route: { params }
      })

    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(1)
    toolTips.forEach(t => expect(t).toBeVisible())
    expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
  })
})