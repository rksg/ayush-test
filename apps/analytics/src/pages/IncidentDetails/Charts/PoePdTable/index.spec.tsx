import '@testing-library/jest-dom'

import { dataApiURL }         from '@acx-ui/analytics/services'
import { fakeIncidentPoePd }  from '@acx-ui/analytics/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findAllByText('Port Number')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should handle sorting column for mac address', async () => {
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
    const macList = await screen.findAllByText('MAC Address')
    expect(macList.length).toBeGreaterThan(0)
    const mac = macList[macList.length - 1]
    fireEvent.click(mac)
  })
  it('should handle sorting column for port number', async () => {
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
    const portNumberList = await screen.findAllByText('Port Number')
    expect(portNumberList.length).toBeGreaterThan(0)
    const portNumber = portNumberList[portNumberList.length - 1]
    fireEvent.click(portNumber)
  })
  it('should handle sorting column for event time', async () => {
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
    const timeList = await screen.findAllByText('Event Time')
    expect(timeList.length).toBeGreaterThan(0)
    const time = timeList[timeList.length - 1]
    fireEvent.click(time)
  })
})
