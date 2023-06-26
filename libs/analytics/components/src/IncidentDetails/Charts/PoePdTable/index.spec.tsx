import '@testing-library/jest-dom'

import { fakeIncidentPoePd }                from '@acx-ui/analytics/utils'
import { useIsSplitOn }                     from '@acx-ui/feature-toggle'
import { dataApiURL, Provider, store }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { impactedApi, Response } from './services'

import { PoePdTable } from '.'

export const response = {
  incident: {
    impactedEntities: [
      {
        name: 'ICX7550-48ZP Router',
        mac: '28:B3:71:29:8C:B6',
        serial: 'one',
        ports: [
          {
            portNumber: '1/1/1',
            metadata: '{"timestamp":1665817971541}'
          },
          {
            portNumber: '1/1/2',
            metadata: '{"timestamp":1665817987689}'
          },
          {
            portNumber: '1/1/1',
            metadata: '{"timestamp":1665818267535}'
          },
          {
            portNumber: '1/1/4',
            metadata: '{"timestamp":1665818333534}'
          },
          {
            portNumber: '1/1/5',
            metadata: '{"timestamp":1665818403526}'
          },
          {
            portNumber: '1/1/13',
            metadata: '{"timestamp":1665818821671}'
          }
        ]
      }
    ]
  }
} as Response

describe('PoeLowTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const row1 = (await screen.findAllByRole('row'))[1]
    expect(row1.textContent).toMatch(/ICX7550-48ZP Router/)
    const links: HTMLAnchorElement[] = screen.getAllByRole('link')
    expect(links[0].href).toBe(
      'http://localhost/undefined/t/devices/switch/28:b3:71:29:8c:b6/one/details/overview'
    )
  })
})
