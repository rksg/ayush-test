import '@testing-library/jest-dom'

import { dataApiURL }                                 from '@acx-ui/analytics/services'
import { fakeIncidentApInfraWanthroughput, Incident } from '@acx-ui/analytics/utils'
import { Provider, store }                            from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'

import { impactedApi }    from './services'
import { expectedResult } from './services.spec'

import { WanthroughputTable } from '.'

describe('WanthroughputTable', () => {
  beforeEach(() => {
    store.dispatch(impactedApi.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
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
    const row1 = (await screen.findAllByRole('row'))[1]
    expect(row1.textContent).toMatch(/Bugbash_R560_Backup/)
  })

  it('should render correctly without Ap Group', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
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
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const headerRow = (await screen.findAllByRole('row'))[0]
    expect(headerRow.textContent).not.toMatch(/AP Group/)
  })
})
