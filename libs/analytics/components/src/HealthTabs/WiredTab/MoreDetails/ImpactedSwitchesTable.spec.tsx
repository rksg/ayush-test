import _ from 'lodash'

import { get }                         from '@acx-ui/config'
import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { moreDetailsDataFixture, noDataFixture } from './__tests__/fixtures'
import { TopNByCPUUsageResult }                  from './config'
import { ImpactedSwitchesTable }                 from './ImpactedSwitchesTable'
import { moreDetailsApi }                        from './services'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('ImpactedSwitchesTable', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )

  it('should show data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixture })
    const { rerender } = render(
      <Router>
        <Provider>
          <ImpactedSwitchesTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='cpuUsage'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText('switch1-cpuUsage')).toBeVisible()

    jest.mocked(get).mockReturnValue('true')
    rerender(
      <Router>
        <Provider>
          <ImpactedSwitchesTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='dhcpFailure'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText('switch1-dhcpFailure')).toBeVisible()
  })
  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: noDataFixture })
    render(
      <Router>
        <Provider>
          <ImpactedSwitchesTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='cpuUsage'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText('Impacted Switches')).toBeVisible()
  })
  it('should not show others in table', async () => {
    const [ element ] = moreDetailsDataFixture.network.hierarchyNode.topNSwitchesByCpuUsage
      .slice(0, 1)
    const cpuUsageArray = new Array(10).fill(element).map((e, i) => ({
      ...e, name: `switch${i}-cpuUsage` }))
    const others = {
      mac: 'Others', name: null, cpuUtilization: 91 } as unknown as TopNByCPUUsageResult
    cpuUsageArray.push(others)

    mockGraphqlQuery(dataApiURL, 'Network', { data: _.set(
      moreDetailsDataFixture, 'network.hierarchyNode.topNSwitchesByCpuUsage', cpuUsageArray) })
    render(
      <Router>
        <Provider>
          <ImpactedSwitchesTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='cpuUsage'
          />
        </Provider>
      </Router>
    )
    expect(screen.queryByText('Others')).not.toBeInTheDocument()
  })
})
