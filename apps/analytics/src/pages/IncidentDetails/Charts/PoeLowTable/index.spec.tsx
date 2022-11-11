import '@testing-library/jest-dom'
import { dataApiURL }            from '@acx-ui/analytics/services'
import {
  fakeIncidentPoeLow, Incident
} from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { impactedApi }    from './services'
import { expectedResult } from './services.spec'

import { PoeLowTable } from '.'

describe('PoeLowTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
      <Provider>
        <PoeLowTable incident={fakeIncidentPoeLow}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const rows = await screen.findAllByRole('row')
    expect(rows[0].textContent).not.toMatch(/AP Group/)
    expect(rows[1].textContent).toMatch(/AnotherAP/)
  })
  it('should show Ap Group column when sliceType is zone', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
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
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const headerRow = (await screen.findAllByRole('row'))[0]
    expect(headerRow.textContent).toMatch(/AP Group/)
  })
})
