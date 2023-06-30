import '@testing-library/jest-dom'

import { fakeIncidentPoeLow, Incident }     from '@acx-ui/analytics/utils'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { impactedApi, Response } from './services'

import { PoeLowTable } from '.'

export const response = {
  incident: {
    impactedEntities: [
      {
        name: 'RuckusAP',
        mac: '84:23:88:2F:ED:60',
        poeMode: {
          configured: 'RKS_AP_PWR_MODE_AUTO',
          operating: 'RKS_AP_PWR_SRC_AF',
          eventTime: 1666970100000,
          apGroup: 'default'
        }
      },
      {
        name: 'AnotherAP',
        mac: '84:23:88:2F:ED:61',
        poeMode: {
          configured: 'RKS_AP_PWR_MODE_BT8',
          operating: 'RKS_AP_PWR_SRC_AT_PLUS',
          eventTime: 1666970130000,
          apGroup: 'default'
        }
      }
    ]
  }
} as Response

describe('PoeLowTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <PoeLowTable incident={fakeIncidentPoeLow}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const rows = await screen.findAllByRole('row')
    expect(rows[0].textContent).not.toMatch(/AP Group/)
    expect(rows[1].textContent).toMatch(/AnotherAP/)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/undefined/t/devices/wifi/84:23:88:2F:ED:61/details/overview'
    )
  })
  it('should show Ap Group column when sliceType is zone', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    const incidentWithZone = {
      ...fakeIncidentPoeLow,
      sliceType: 'zone'
    }
    render(
      <Provider>
        <PoeLowTable incident={incidentWithZone as Incident}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const headerRow = (await screen.findAllByRole('row'))[0]
    expect(headerRow.textContent).toMatch(/AP Group/)
  })
})
