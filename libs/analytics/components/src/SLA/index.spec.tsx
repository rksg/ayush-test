
import { BrowserRouter as Router  }         from '@acx-ui/react-router-dom'
import { Provider, dataApiURL }             from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { SLA } from '.'

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

    render(<Router><Provider><SLA/></Provider></Router>)

    expect(await screen.findByText('SLA')).toBeVisible()
    expect(await screen.findByText('Connection Success')).toBeVisible()
    expect(await screen.findByText('Time To Connect')).toBeVisible()
    expect(await screen.findByText('Client Throughput')).toBeVisible()
    expect(await screen.findAllByText('0% meets goal')).toHaveLength(3)
  })
})
