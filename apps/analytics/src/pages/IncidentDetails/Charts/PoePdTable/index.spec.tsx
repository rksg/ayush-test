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
    const { asFragment } = render(
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

    await screen.findAllByText('ICX7550-48ZP Router')
    await screen.findAllByText('28:B3:71:29:8C:B6')
    await screen.findAllByText('1/1/13')
    await screen.findAllByText('Port Number')
    expect(asFragment()).toMatchSnapshot()
  })
})
