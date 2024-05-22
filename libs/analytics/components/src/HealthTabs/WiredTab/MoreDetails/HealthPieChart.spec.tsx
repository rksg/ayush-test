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

const switchInfo = {
  mac: 'mac1',
  name: ''
}
const switchDetails = {
  serial: '',
  model: '',
  status: '',
  firmware: '',
  numOfPorts: 0
}

describe('MoreDetailsPieChart', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )

  it.each(['cpuUsage', 'dhcpFailure', 'congestion', 'portStorm'])(
    'should show data', async (queryType) => {
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
  it('should show "Top 5" in title when top 5 is available', async () => {
    let moreDetailsDataFixtureCopy = moreDetailsDataFixture
    const cpuUsageArray = moreDetailsDataFixtureCopy.network.hierarchyNode.topNSwitchesByCpuUsage
    const count = 5

    while (cpuUsageArray.length < count) {
      cpuUsageArray.push({
        ...switchInfo,
        ...switchDetails,
        cpuUtilization: 0,
        name: `switch${cpuUsageArray.length + 1}-cpuUsage`
      })
    }

    mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixtureCopy })
    render(
      <Provider>
        <MoreDetailsPieChart
          filters={{
            filter: {},
            startDate: '2021-12-31T00:00:00+00:00',
            endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
          }
          queryType='cpuUsage' />
      </Provider>
    )
    expect(await screen.findByText('Top 5')).toBeVisible()
  })
  it('should show no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: noDataFixture })
    render(
      <Provider>
        <MoreDetailsPieChart filters={{} as AnalyticsFilter} queryType='cpuUsage' />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
})

describe('transformData', () => {
  const metricsData = [
    {
      key: 'cpuUsage',
      value: [
        {
          cpuUtilization: 80,
          ...switchInfo,
          ...switchDetails
        }
      ]
    },
    {
      key: 'dhcpFailure',
      value: [
        {
          dhcpFailureCount: 80,
          ...switchInfo,
          ...switchDetails
        }
      ]
    },
    {
      key: 'congestion',
      value: [
        {
          congestedPortCount: 80,
          ...switchInfo
        }
      ]
    },
    {
      key: 'portStorm',
      value: [
        {
          stormPortCount: 80,
          ...switchInfo
        }
      ]
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
