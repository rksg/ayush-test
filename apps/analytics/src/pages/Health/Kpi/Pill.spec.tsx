import userEvent from '@testing-library/user-event'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter, kpiConfig }       from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange, getIntl }               from '@acx-ui/utils'

import HealthPill from './Pill'
import { api }    from './services'


const filters = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours,
  filter: {}
} as AnalyticsFilter
const thresholdMap = {
  timeToConnect: 2000,
  rss: -75,
  clientThroughput: 10000,
  apCapacity: 50,
  apServiceUptime: 0.995,
  apToSZLatency: 200,
  switchPoeUtilization: 0.8
}
const timeWindow: [string, string] = ['2022-01-01T00:00:00+08:00', '2022-01-02T00:00:00+08:00']
describe('Pill with kpi threshold', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render pill with data (success below threshold)', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [0, 2, 2, 3, 3, 0] } }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'timeToConnect'}
          timeWindow={timeWindow}
          threshold={thresholdMap['timeToConnect']}
        />
      </Provider>
    )
    await screen.findByText('Time To Connect')
    expect(screen.getByText('20% meets goal')).toBeVisible()
  })
  it('should render pill with data (success above threshold)', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [1, 2, 2, 3, 2, 0, 0] } }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'clientThroughput'}
          timeWindow={timeWindow}
          threshold={thresholdMap['clientThroughput']}
        />
      </Provider>
    )
    await screen.findByText('Client Throughput')
    expect(screen.getByText('90% meets goal')).toBeVisible()
  })

  it('should render pill with data for reverse interpreted values', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [1, 1, 1, 1, 1, 1, 1, 1, 2] } }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'rss'}
          timeWindow={timeWindow}
          threshold={thresholdMap['rss']}
        />
      </Provider>
    )
    await screen.findByText('Client RSS')
    expect(screen.getByText('50% meets goal')).toBeVisible()
  })
  it('should render pill with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'histogramKPI', {
      data: { histogram: { data: [] } }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'timeToConnect'}
          timeWindow={timeWindow}
          threshold={thresholdMap['timeToConnect']}
        />
      </Provider>
    )
    await screen.findByText('Time To Connect')
    expect(screen.getByText('0% meets goal')).toBeVisible()
  })

})
describe('Pill without kpi threshold', () => {
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
  const timeWindow: [string, string] = ['2022-04-07T09:15:00.000Z', '2022-04-07T10:15:00.000Z']
  const sampleNoDataTS = {
    time: [],
    data: []
  }

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())

  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'onlineAPs'}
          timeWindow={timeWindow}
          threshold={0}
        />
      </Provider>
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })
  it('should render pill with data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'onlineAPs'}
          timeWindow={timeWindow}
          threshold={0}
        />
      </Provider>
    )
    await screen.findByText('Online APs')
    expect(screen.getByText('80%')).toBeVisible()
  })
  it('should render pill with no data', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleNoDataTS }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'onlineAPs'}
          timeWindow={timeWindow}
          threshold={0}
        />
      </Provider>
    )
    await screen.findByText('Online APs')
    expect(screen.getByText('0%')).toBeVisible()
  })
  it('should render pill with correct tooltip', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleNoDataTS }
    })
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'onlineAPs'}
          timeWindow={timeWindow}
          threshold={0}
        />
      </Provider>
    )
    const { tooltip } = kpiConfig['onlineAPs'].pill
    const { $t } = getIntl()
    await screen.findByText('Online APs')
    const infoIcon = screen.getByText('InformationOutlined.svg')
    await userEvent.hover(infoIcon)
    expect(await screen.findByRole('tooltip', { hidden: true }))
      .toHaveTextContent($t(tooltip, { br: '\n' }).replace('\n', '').replace('\n', ' '))
  })
  it('should calculate results according to time window', async () => {
    mockGraphqlQuery(dataApiURL, 'timeseriesKPI', {
      data: { timeSeries: sampleTS }
    })
    const timeWindow: [string, string] = ['2022-04-07T09:15:00.000Z', '2022-04-07T10:00:00.000Z']
    render(
      <Provider>
        <HealthPill
          filters={filters}
          kpi={'onlineAPs'}
          timeWindow={timeWindow}
          threshold={0}
        />
      </Provider>
    )
    await screen.findByText('Online APs')
    expect(screen.getByText('80%')).toBeVisible()
  })
})
