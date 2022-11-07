
import { dataApiURL, healthApi }            from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import BarChart, { formatYDataPoint } from './BarChart'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter

const thresholdMap = {
  timeToConnect: '2000',
  rss: '-75',
  clientThroughput: '10000',
  apCapacity: '50',
  apServiceUptime: '0.995',
  apToSZLatency: '200',
  switchPoeUtilization: '0.8'
}
describe('Threshold barchart', () => {
  const sampleTS = {
    time: [
      '2022-04-07T09:15:00.000Z',
      '2022-04-07T09:30:00.000Z',
      '2022-04-07T09:45:00.000Z',
      '2022-04-07T10:00:00.000Z',
      '2022-04-07T10:15:00.000Z'
    ],
    data: [null, [null, null], [0, 0], [4, 5], [4, 5]]
  }

  const sampleNoDataTS = {
    time: ['2022-04-07T09:15:00.000Z'],
    data: []
  }

  beforeEach(() => {
    store.dispatch(healthApi.util.resetApiState())

  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(<Provider>
      <BarChart
        filters={filters}
        kpi={'timeToConnect'}
        threshold={thresholdMap['timeToConnect'] as unknown as number}
      />
    </Provider>)
    expect(await screen.findByRole('img', { name: 'loader' })).toBeInTheDocument()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(
      <Provider>
        <BarChart
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as number}
        />
      </Provider>
    )
    expect(await screen.findByText('80%')).toBeVisible()
  })
  it('should render chart with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleNoDataTS }
    })
    render(
      <Provider>
        <BarChart
          filters={filters}
          kpi={'timeToConnect'}
          threshold={thresholdMap['timeToConnect'] as unknown as number}
        />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
  it('should format y value for barChart', async () => {
    expect(formatYDataPoint(null)).toStrictEqual('-')
    expect(formatYDataPoint(0.1)).toStrictEqual('0.1%')
  })
})
