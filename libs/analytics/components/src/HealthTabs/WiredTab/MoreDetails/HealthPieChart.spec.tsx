import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { moreDetailsDataFixture }             from './__tests__/fixtures'
import { MoreDetailsPieChart, transformData } from './HealthPieChart'
import { moreDetailsApi }                     from './services'

describe('MoreDetailsPieChart', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )

  it.each(['cpu', 'dhcp', 'congestedPort', 'stormPort'])
  ('should show data', async (queryType) => {
    mockGraphqlQuery(dataApiURL, 'PieChartQuery', { data: moreDetailsDataFixture })
    render(
      <Provider>
        <MoreDetailsPieChart
          filters={{
            filter: {},
            startDate: '2021-12-31T00:00:00+00:00',
            endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
          }
          queryType={queryType} />
      </Provider>
    )
    expect(await screen.findByText('switch1')).toBeVisible()
  })
  it('should show no data', async () => {
    render(
      <Provider>
        <MoreDetailsPieChart filters={{} as AnalyticsFilter} queryType='someType' />
      </Provider>
    )
    const element = screen.getByText('No data to display')
    expect(element).toBeInTheDocument()
  })
})

describe('transformData', () => {
  const metricsData = [
    { key: 'cpu', value: [{ mac: 'mac1', cpuUtilization: 80, name: '',
      serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }] },
    {
      key: 'dhcp', value: [{ mac: 'mac1', dhcpFailureCount: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }]
    },
    {
      key: 'congestedPort', value: [{ mac: 'mac1', congestedPortCount: 80, name: '' }]
    },
    {
      key: 'stormPort', value: [{ mac: 'mac1', stormPortCount: 80, name: '' }]
    }
  ]
  it.each(metricsData)('should transform data correctly', ({ key, value }) => {
    const expectedPieChartData = [
      { mac: 'mac1', value: 80, name: '', color: '#66B1E8' }
    ]
    const result = transformData(key, value)
    expect(result).toEqual(expectedPieChartData)
  })
})
