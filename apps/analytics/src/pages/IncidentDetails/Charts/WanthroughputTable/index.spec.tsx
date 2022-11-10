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

    await screen.findAllByText('100/1000/2500Mbps')
    await screen.findAllByText('20:58:69:3B:CB:70')
    await screen.findAllByText('Interface')
    await screen.findAllByText('WAN Link Capability')
    await screen.findAllByText('WAN Link')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly without Ap Group', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    const incidentWithZone = {
      ...fakeIncidentApInfraWanthroughput,
      sliceType: 'ap'
    }
    const { asFragment } = render(
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
    expect(asFragment()).toMatchSnapshot()
  })
})
