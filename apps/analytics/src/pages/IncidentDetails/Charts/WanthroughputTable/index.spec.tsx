import '@testing-library/jest-dom'

import { fakeIncidentApInfraWanthroughput, Incident } from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }                from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }           from '@acx-ui/test-utils'

import { impactedApi, Response } from './services'

import { WanthroughputTable } from '.'

export const response = {
  incident: {
    impactedEntities: [
      {
        name: 'E04_Warehouse_R560-Replaced',
        mac: 'C8:84:8C:10:4B:00',
        ports: [
          {
            interface: 'eth1',
            capability: '100/1000/2500/5000Mbps',
            link: 'Up 2500Mbps full',
            eventTime: 1667346300000,
            apGroup: 'East Side'
          }
        ]
      },
      {
        name: 'E02_Bugbash_R560_Main',
        mac: 'C8:84:8C:10:4F:E0',
        ports: [
          {
            interface: 'eth1',
            capability: '100/1000/2500/5000Mbps',
            link: 'Up 2500Mbps full',
            eventTime: 1667346300000,
            apGroup: 'East Side'
          }
        ]
      },
      {
        name: 'Bugbash_R560_Backup',
        mac: 'C8:84:8C:10:D3:30',
        ports: [
          {
            interface: 'eth1',
            capability: '100/1000/2500/5000Mbps',
            link: 'Up 2500Mbps full',
            eventTime: 1666020600000,
            apGroup: 'DENSITY'
          }
        ]
      }
    ]
  }
} as Response

describe('WanthroughputTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const row1 = (await screen.findAllByRole('row'))[1]
    expect(row1.textContent).toMatch(/Bugbash_R560_Backup/)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/undefined/t/devices/wifi/C8:84:8C:10:D3:30/details/overview'
    )
  })

  it('should render correctly without Ap Group', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    const incidentWithZone = {
      ...fakeIncidentApInfraWanthroughput,
      sliceType: 'ap'
    }
    render(
      <Provider>
        <WanthroughputTable incident={incidentWithZone as Incident}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const headerRow = (await screen.findAllByRole('row'))[0]
    expect(headerRow.textContent).not.toMatch(/AP Group/)
  })
})
