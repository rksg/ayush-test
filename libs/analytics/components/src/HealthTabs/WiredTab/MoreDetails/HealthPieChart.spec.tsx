import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { moreDetailsDataFixture, noDataFixture } from './__tests__/fixtures'
import { WidgetType }                            from './config'
import { MoreDetailsPieChart, transformData }    from './HealthPieChart'
import { moreDetailsApi }                        from './services'

describe('MoreDetailsPieChart', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )

  it.each(['cpuUsage', 'dhcpFailure', 'congestion', 'portStorm'])
  ('should show data', async (queryType) => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixture })
    render(
      <Provider>
        <MoreDetailsPieChart
          filters={{
            filter: {},
            startDate: '2021-12-31T00:00:00+00:00',
            endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
          }
          queryType={queryType as WidgetType as 'cpuUsage' | 'dhcpFailure' |
          'congestion' | 'portStorm'} />
      </Provider>
    )
    expect(await screen.findByText(`switch1-${queryType}`)).toBeVisible()
  })
  it('should show no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: noDataFixture })
    render(
      <Provider>
        <MoreDetailsPieChart filters={{} as AnalyticsFilter} queryType='cpuUsage' />
      </Provider>
    )
    const element = screen.getByText('No data to display')
    expect(element).toBeInTheDocument()
  })
})

describe('transformData', () => {
  const metricsData = [
    { key: 'cpuUsage', value: [{ mac: 'mac1', cpuUtilization: 80, name: '',
      serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }] },
    {
      key: 'dhcpFailure', value: [{ mac: 'mac1', dhcpFailureCount: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }]
    },
    {
      key: 'congestion', value: [{ mac: 'mac1', congestedPortCount: 80, name: '' }]
    },
    {
      key: 'portStorm', value: [{ mac: 'mac1', stormPortCount: 80, name: '' }]
    }
  ]
  it.each(metricsData)('should transform data correctly', ({ key, value }) => {
    const expectedPieChartData = [
      { mac: 'mac1', value: 80, name: '', color: '#66B1E8' }
    ]
    const result = transformData(key as WidgetType, value)
    expect(result).toEqual(expectedPieChartData)
  })
})
