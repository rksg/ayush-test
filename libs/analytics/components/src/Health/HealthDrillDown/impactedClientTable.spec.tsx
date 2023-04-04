import '@testing-library/jest-dom'
import { range } from 'lodash'

import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import {  mockImpactedClient }  from './__tests__/fixtures'
import { ImpactedClientsTable } from './impactedClientTable'
import { api }                  from './services'


describe('ImpactedClientsTable', () => {
  const filters = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  } as AnalyticsFilter
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  it('should render ImpactedClientsTable', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockImpactedClient })
    render(
      <Provider>
        <ImpactedClientsTable
          filters={filters}
          drillDownSelection='connectionFailure'
          selectedStage='assoFailure'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('2 Impacted Clients')).toBeVisible()
  })
  it('should show zero impacted clients for empty array', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            impactedClients: []
          }
        }
      }
    })
    render(
      <Provider>
        <ImpactedClientsTable
          filters={filters}
          drillDownSelection='connectionFailure'
          selectedStage='assoFailure'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('0 Impacted Clients')).toBeVisible()
  })
  it('should show only top 100 impacted clients', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            impactedClients: range(0, 101).map(() => {
              return {
                mac: 'D0:C6:37:D7:52:80',
                manufacturer: 'Intel Corporate',
                ssid: 'Divya_1_hour',
                hostname: 'DESKTOP-K1PAM9U',
                username: 'DPSK_User_8709'
              }
            })
          }
        }
      }
    })
    render(
      <Provider>
        <ImpactedClientsTable
          filters={filters}
          drillDownSelection='connectionFailure'
          selectedStage='assoFailure'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('Top 100 Impacted Clients')).toBeVisible()
  })
})


