import { range, uniqueId } from 'lodash'

import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

import {  mockImpactedClient }  from './__tests__/fixtures'
import { PieChartData }         from './healthPieChart'
import { ImpactedClientsTable } from './impactedClientTable'
import { api }                  from './services'


describe('ImpactedClientsTable', () => {
  const filters: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  it('should render ImpactedClientsTable', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', { data: mockImpactedClient })
    render(
      <Provider>
        <ImpactedClientsTable
          filters={filters}
          pieList={[]}
          drillDownSelection='connectionFailure'
          selectedStage='Association'
          pieFilter={null}
          chartKey='nodes'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('1 Impacted Client')).toBeVisible()
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
          pieList={[]}
          drillDownSelection='connectionFailure'
          selectedStage='Association'
          pieFilter={null}
          chartKey='nodes'
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
  it('should show only top 10 impacted clients', async () => {
    const samplePieList = [
      { rawKey: 'Others', name: 'Others' },
      { rawKey: 'secondpie', name: 'secondpie' }
    ] as PieChartData[]
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            impactedClients: range(0, 11).map(() => {
              return {
                mac: uniqueId(),
                manufacturer: 'Intel Corporate',
                ssid: 'Divya_1_hour',
                hostname: 'DESKTOP-K1PAM9U',
                username: 'DPSK_User_8709',
                osType: 'osType'
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
          pieList={samplePieList}
          drillDownSelection='connectionFailure'
          selectedStage='Association'
          pieFilter={null}
          chartKey='nodes'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('Top 10 Impacted Clients')).toBeVisible()
    expect(await screen.findAllByText('Intel Corporate')).toHaveLength(10)
    expect(await screen.findAllByText('osType')).toHaveLength(10)
  })
  it('should show only top 10 impacted clients with filtered text', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const samplePieList = [
      { rawKey: 'Others', name: 'Others' },
      { rawKey: 'secondpie', name: 'secondpie' }
    ] as PieChartData[]
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: {
          hierarchyNode: {
            impactedClients: range(0, 11).map(() => {
              return {
                mac: uniqueId(),
                manufacturer: 'Intel Corporate',
                ssid: 'Divya_1_hour',
                hostname: 'DESKTOP-K1PAM9U',
                username: 'DPSK_User_8709',
                osType: 'osType'
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
          pieList={samplePieList}
          drillDownSelection='connectionFailure'
          selectedStage='Association'
          pieFilter={
            { key: 'secondpie', name: 'secondpie', rawKey: 'secondpie', value: 10, color: 'gray' }}
          chartKey='nodes'
        />
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/health',
          wrapRoutes: false
        }
      }
    )
    expect(await screen.findByText('Top 10 Impacted Clients filtered by: secondpie')).toBeVisible()
    expect(await screen.findAllByText('Intel Corporate')).toHaveLength(10)
    expect(await screen.findAllByText('osType')).toHaveLength(10)
  })
})
