import { render,screen } from '@testing-library/react'
import { rest }          from 'msw'
import { BrowserRouter } from 'react-router-dom'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { EdgeUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { mockServer }      from '@acx-ui/test-utils'
import { DateRange }       from '@acx-ui/utils'

import { mockedTopEdgesResourcesData } from './__tests__/fixtures'

import { TopEdgesByResources } from '.'

describe('TopEdgesByResourcesWidget', () => {
  const filters : AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }
  const wrapper = (<BrowserRouter>
    <Provider>
      <TopEdgesByResources filters={filters}/>
    </Provider>
  </BrowserRouter>)

  beforeEach(() =>{
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgesTopResources.url,
        (req, res, ctx) => res(ctx.json(mockedTopEdgesResourcesData))
      )
    )
  })

  it('should render chart', async () => {
    const { asFragment } =render(wrapper)
    await screen.findByText('Top 5 SmartEdges by Resource Utilization')
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
  })
})