import '@testing-library/jest-dom'
import { dataApiURL }  from '@acx-ui/analytics/services'
import {
  fakeIncidentPoeLow
} from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
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
    const { asFragment } = render(
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findAllByText('Configured PoE Mode')
    await screen.findAllByText('Operating PoE Mode')
    expect(asFragment()).toMatchSnapshot()
  })
})