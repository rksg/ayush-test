import { healthApi }                        from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { TimeStampRange }                   from '@acx-ui/types'
import { DateRange }                        from '@acx-ui/utils'

import { HealthPageContext } from '../HealthPageContext'

import KpiTimeseries, { formatYDataPoint } from './Timeseries'

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  filter: {}
}

describe('Kpi timeseries', () => {
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

  const chartRef = jest.fn()
  const setTimeWindow = jest.fn()
  const timeWindow = ['2022-04-07T09:15:00.000Z', '2022-04-07T10:15:00.000Z'] as TimeStampRange
  const threshold = 10
  const healthContext = {
    ...filters,
    timeWindow,
    setTimeWindow,
    apCount: 10
  }
  beforeEach(() => {
    store.dispatch(healthApi.util.resetApiState())

  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    render(<Provider><HealthPageContext.Provider value={{ ...healthContext }}>
      <KpiTimeseries
        filters={filters}
        kpi={'onlineAPs'}
        chartRef={chartRef}
        setTimeWindow={setTimeWindow}
        timeWindow={timeWindow}
        threshold={threshold}
      />
    </HealthPageContext.Provider></Provider>
    )
    expect(await screen.findByRole('img', { name: 'loader' })).toBeInTheDocument()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleTS } }
    })
    render(<Provider><HealthPageContext.Provider value={{ ...healthContext }}>
      <KpiTimeseries
        filters={filters}
        kpi={'onlineAPs'}
        chartRef={chartRef}
        setTimeWindow={setTimeWindow}
        timeWindow={timeWindow}
        threshold={threshold}
      />
    </HealthPageContext.Provider></Provider>)
    expect(await screen.findByText('80%')).toBeVisible()
  })
  it('should render chart with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { network: { timeSeries: sampleNoDataTS } }
    })
    render(<Provider><HealthPageContext.Provider value={{ ...healthContext }}>
      <KpiTimeseries
        filters={filters}
        kpi={'onlineAPs'}
        chartRef={chartRef}
        setTimeWindow={setTimeWindow}
        timeWindow={timeWindow}
        threshold={threshold}
      />
    </HealthPageContext.Provider></Provider>)
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
  it('should format y value for timeseries', async () => {
    expect(formatYDataPoint(null)).toStrictEqual('--')
    expect(formatYDataPoint(0.1)).toStrictEqual('10%')
  })
})
