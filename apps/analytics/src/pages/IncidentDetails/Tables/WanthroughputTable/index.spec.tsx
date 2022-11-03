import '@testing-library/jest-dom'

import { dataApiURL }                       from '@acx-ui/analytics/services'
import { fakeIncidentApInfraWanthroughput } from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { impactedApi }    from './services'
import { expectedResult } from './services.spec'

import { WanthroughputTable } from '.'

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
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findAllByText('Interface')
    await screen.findAllByText('WAN Link Capability')
    await screen.findAllByText('WAN Link')
    expect(asFragment()).toMatchSnapshot()
  })
})