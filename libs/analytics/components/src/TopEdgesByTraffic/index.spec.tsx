import { render,screen } from '@testing-library/react'
import { rest }          from 'msw'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { EdgeUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { mockServer }      from '@acx-ui/test-utils'
import { DateRange }       from '@acx-ui/utils'

import { mockedTopEdgesTrafficData } from './__tests__/fixtures'

import { TopEdgesByTraffic } from '.'

describe('TopEdgesByTrafficWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }
  beforeEach(() =>
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgesTopTraffic.url,
        (req, res, ctx) => res(ctx.json(mockedTopEdgesTrafficData))
      )
    )
  )

  it('should render chart', async () => {
    const { asFragment } =render(
      <Provider> <TopEdgesByTraffic filters={filters}/></Provider>)
    await screen.findByText('Top 5 SmartEdges by Traffic')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
})