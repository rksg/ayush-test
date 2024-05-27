import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import { moreDetailsDataFixture, noDataFixture } from './__tests__/fixtures'
import { ImpactedSwitchesTable }                 from './ImpactedSwitchesTable'
import { moreDetailsApi }                        from './services'

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
})
