import '@testing-library/jest-dom'
import { dataApiURL }            from '@acx-ui/analytics/services'
import {
  fakeIncidentPoeLow, Incident
} from '@acx-ui/analytics/utils'
import { Provider, store } from '@acx-ui/store'
import {
  fireEvent,
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
    await screen.findAllByText('84:23:88:2F:ED:60')
    await screen.findAllByText('RuckusAP')
    await screen.findAllByText('Auto')
    await screen.findAllByText('Configured PoE Mode')
    await screen.findAllByText('Operating PoE Mode')
    expect(asFragment()).toMatchSnapshot()
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
    await screen.findAllByText('AP Group')
  })
  it('should handle sorting column for mac address', async () => {
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
    const macList = await screen.findAllByText('MAC Address')
    expect(macList.length).toBeGreaterThan(0)
    const mac = macList[macList.length - 1]
    fireEvent.click(mac)
  })
  it('should handle sorting column for ap group', async () => {
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
    const apGroupList = await screen.findAllByText('AP Group')
    expect(apGroupList.length).toBeGreaterThan(0)
    const apGroup = apGroupList[apGroupList.length - 1]
    fireEvent.click(apGroup)
  })
  it('should handle sorting column for configured poe mode', async () => {
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
    const configuredList = await screen.findAllByText('Configured PoE Mode')
    expect(configuredList.length).toBeGreaterThan(0)
    const configured = configuredList[configuredList.length - 1]
    fireEvent.click(configured)
  })
  it('should handle sorting column for operating poe mode', async () => {
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
    const operatingList = await screen.findAllByText('Operating PoE Mode')
    expect(operatingList.length).toBeGreaterThan(0)
    const operating = operatingList[operatingList.length - 1]
    fireEvent.click(operating)
  })
  it('should handle sorting column for event time', async () => {
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
    const timeList = await screen.findAllByText('Event Time')
    expect(timeList.length).toBeGreaterThan(0)
    const time = timeList[timeList.length - 1]
    fireEvent.click(time)
  })
})
