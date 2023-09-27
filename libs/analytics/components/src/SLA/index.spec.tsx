import { defaultNetworkPath }                 from '@acx-ui/analytics/utils'
import { BrowserRouter as Router  }           from '@acx-ui/react-router-dom'
import { Provider, dataApiURL }               from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }   from '@acx-ui/test-utils'
import { NetworkPath, PathFilter, DateRange } from '@acx-ui/utils'

import { SLA } from '.'


const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('SLA', () => {
  it('should render',async () => {
    mockGraphqlQuery(dataApiURL, 'GetKpiThresholds', {
      data: {} })
    mockGraphqlQuery(dataApiURL, 'APCountForNode', {
      data: { network: { node: { apCount: 0 } } } })
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { network: { histogram: { data: [] } } } })
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: { time: [], data: [] } } } })

    render(<Router><Provider><SLA pathFilters={pathFilters}/></Provider></Router>)

    expect(await screen.findByText('SLA')).toBeVisible()
    expect(await screen.findByText('Connection Success')).toBeVisible()
    expect(await screen.findByText('Time To Connect')).toBeVisible()
    expect(await screen.findByText('Client Throughput')).toBeVisible()
    expect(await screen.findAllByText('0% meets goal')).toHaveLength(3)
  })

  it('renders no data for switch path', async () => {
    const switchPathFilters = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'switchGroup', name: 'sg1' }
      ] as NetworkPath
    }
    render(<Router><Provider><SLA pathFilters={switchPathFilters}/></Provider></Router>)

    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})
