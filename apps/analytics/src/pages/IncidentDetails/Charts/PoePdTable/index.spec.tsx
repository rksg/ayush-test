import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { fakeIncidentPoePd }                from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { impactedApi, Response } from './services'

import { PoePdTable } from '.'

export const response = {
  incident: {
    impactedEntities: [
      {
        name: 'ICX7550-48ZP Router',
        mac: '28:B3:71:29:8C:B6',
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
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', { data: response })
    render(
      <Provider>
        <PoePdTable incident={fakeIncidentPoePd}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const row1 = (await screen.findAllByRole('row'))[1]
    expect(row1.textContent).toMatch(/ICX7550-48ZP Router/)
  })
})
