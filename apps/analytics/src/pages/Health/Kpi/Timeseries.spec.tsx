import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { timeseriesApi }                   from './services'
import KpiTimeseries, { formatYDataPoint } from './Timeseries'

const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter

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

  beforeEach(() => {
    store.dispatch(timeseriesApi.util.resetApiState())

  })

  it('should render loader', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(<Provider><KpiTimeseries filters={filters} kpi={'onlineAPs'}/></Provider>)
    expect(await screen.findByRole('img', { name: 'loader' })).toBeInTheDocument()
  })
  it('should render chart', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(
      <Provider> <KpiTimeseries filters={filters} kpi={'onlineAPs'}/></Provider>
    )
    expect(await screen.findByText('80%')).toBeVisible()
  })
  it('should render chart with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleNoDataTS }
    })
    render(
      <Provider> <KpiTimeseries filters={filters} kpi={'onlineAPs'}/></Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
  it('should format y value for timeseries', async () => {
    expect(formatYDataPoint(null)).toStrictEqual('-')
    expect(formatYDataPoint(0.1)).toStrictEqual('10%')
  })
})
