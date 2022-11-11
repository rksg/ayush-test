import '@testing-library/jest-dom'

import { dataApiURL }        from '@acx-ui/analytics/services'
import { fakeIncidentPoePd } from '@acx-ui/analytics/utils'
import { Provider, store }   from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { impactedApi }    from './services'
import { expectedResult } from './services.spec'

import { PoePdTable } from '.'

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
