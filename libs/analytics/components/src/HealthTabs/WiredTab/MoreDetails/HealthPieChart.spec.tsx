import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { formatter }                   from '@acx-ui/formatter'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { moreDetailsDataFixture, noDataFixture }                from './__tests__/fixtures'
import { TopNByCPUUsageResult, WidgetType }                     from './config'
import { MoreDetailsPieChart, tooltipFormatter, transformData } from './HealthPieChart'
import { moreDetailsApi }                                       from './services'

const switchInfo = {
  mac: 'mac1',
  name: 'switch1'
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
            title='test'
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType={queryType as WidgetType as 'cpuUsage' | 'dhcpFailure' |
          'congestion' | 'portStorm'} />
        </Provider>
      )
      expect(await screen.findByText(`switch1-${queryType} (mac1)`)).toBeVisible()
    })

  it('When only 5 records available', async () => {
    let moreDetailsDataFixtureCopy = moreDetailsDataFixture
    const cpuUsageArray = moreDetailsDataFixture.network.hierarchyNode.topNSwitchesByCpuUsage
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
          title='test'
          filters={{
            filter: {},
            startDate: '2021-12-31T00:00:00+00:00',
            endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
          }
          queryType='cpuUsage' />
      </Provider>
    )
    expect(screen.queryByText(/Top 5/)).not.toBeInTheDocument()
    expect(screen.queryByText('Others')).not.toBeInTheDocument()
    expect(screen.queryByText(/Detailed breakup of all items beyond Top 5/))
      .not.toBeInTheDocument()
  })
  describe('When more than 5 records available', () => {
    let moreDetailsDataFixtureCopy = moreDetailsDataFixture
    beforeEach(() => {
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
      const others = {
        mac: 'Others', name: null, cpuUtilization: 91 } as unknown as TopNByCPUUsageResult
      cpuUsageArray.push(others)
      mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixtureCopy })
    })
    it('Features.HEALTH_WIRED_TOPN_WITH_OTHERS disabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      render(
        <Provider>
          <MoreDetailsPieChart
            title='test'
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='cpuUsage' />
        </Provider>
      )
      expect(await screen.findByText('Top 5')).toBeVisible()
      expect(screen.queryByText('Others')).not.toBeInTheDocument()
      expect(screen.queryByText(/Detailed breakup of all items beyond Top 5/))
        .not.toBeInTheDocument()
    })
    it('Features.HEALTH_WIRED_TOPN_WITH_OTHERS enabled', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      render(
        <Provider>
          <MoreDetailsPieChart
            title='test'
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='cpuUsage' />
        </Provider>
      )
      expect(await screen.findByText('Top 5')).toBeVisible()
      expect(await screen.findByText('Others')).toBeVisible()
      expect(await screen.findByText(/Detailed breakup of all items beyond Top 5/)).toBeVisible()
    })
  })

  it('should show no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: noDataFixture })
    render(
      <Provider>
        <MoreDetailsPieChart
          title='test'
          filters={{
            filter: {},
            startDate: '2021-12-31T00:00:00+00:00',
            endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
          }
          queryType='cpuUsage' />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  describe('tooltipFormatter', () => {
    it('returns formatted values and percentage', () => {
      expect(tooltipFormatter(50, formatter('countFormat'))(25)).toEqual('50% (25)')
    })
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
      { mac: 'mac1', value: 80, name: 'switch1 (mac1)', color: '#66B1E8' }
    ]
    const result = transformData(key as WidgetType, value)
    expect(result).toEqual(expectedPieChartData)
  })
})
