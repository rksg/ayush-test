import { get }                         from '@acx-ui/config'
import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen }  from '@acx-ui/test-utils'
import { AnalyticsFilter } from '@acx-ui/utils'

import {
  impactedClientsData,
  emptyImpactedClientsData,
  moreDetailsDataFixture
}                               from './__tests__/fixtures'
import { ImpactedClientsTable } from './ImpactedClientsTable'
import { moreDetailsApi }       from './services'

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('ImpactedClientsTable', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )

  it('should show data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: moreDetailsDataFixture })
    mockGraphqlQuery(dataApiURL, 'SwitchClients', { data: impactedClientsData })
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { rerender } = render(
      <Router>
        <Provider>
          <ImpactedClientsTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='portStorm'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText('ICX8200-48PF Router')).toBeVisible()

    jest.mocked(get).mockReturnValue('true')
    rerender(
      <Router>
        <Provider>
          <ImpactedClientsTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='congestion'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText('ICX8200-C08ZP Router')).toBeVisible()
  })
  it('should handle when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: emptyImpactedClientsData })
    mockGraphqlQuery(dataApiURL, 'SwitchClients', { data: emptyImpactedClientsData })
    render(
      <Router>
        <Provider>
          <ImpactedClientsTable
            filters={{
              filter: {},
              startDate: '2021-12-31T00:00:00+00:00',
              endDate: '2022-01-01T00:00:00+00:00' } as AnalyticsFilter
            }
            queryType='congestion'
          />
        </Provider>
      </Router>
    )
    expect(await screen.findByText(/Impacted Uplink Port/)).toBeVisible()
  })
})
