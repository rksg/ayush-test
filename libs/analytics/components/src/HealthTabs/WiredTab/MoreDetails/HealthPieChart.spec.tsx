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

  it.each(['cpu', 'dhcp'])('should show data', async (queryType) => {
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
  it('should transform data correctly', () => {
    const cpuData = [
      { mac: 'mac1', cpuUtilization: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac2', cpuUtilization: 60, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac3', cpuUtilization: 70, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }
    ]

    const dhcpData = [
      { mac: 'mac1', dhcpFailureCount: 80, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac2', dhcpFailureCount: 60, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 },
      { mac: 'mac3', dhcpFailureCount: 70, name: '',
        serial: '', model: '',status: '', firmware: '',numOfPorts: 0 }
    ]

    const expectedPieChartData = [
      { mac: 'mac1', value: 80, name: '', color: '#66B1E8' },
      { mac: 'mac2', value: 60, name: '', color: '#EC7100' },
      { mac: 'mac3', value: 70, name: '', color: '#F9C34B' }
    ]

    const cpuResult = transformData('cpu', cpuData)
    expect(cpuResult).toEqual(expectedPieChartData)

    const dhcpResult = transformData('dhcp', dhcpData)
    expect(dhcpResult).toEqual(expectedPieChartData)
  })
})
