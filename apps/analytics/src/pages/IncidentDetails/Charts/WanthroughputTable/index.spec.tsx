import '@testing-library/jest-dom'

import { dataApiURL }                                 from '@acx-ui/analytics/services'
import { fakeIncidentApInfraWanthroughput, Incident } from '@acx-ui/analytics/utils'
import { Provider, store }                            from '@acx-ui/store'
import {
  fireEvent,
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    await screen.findAllByText('Interface')
    await screen.findAllByText('WAN Link Capability')
    await screen.findAllByText('WAN Link')
    expect(asFragment()).toMatchSnapshot()
  })
  it('should not show Ap Group column when sliceType is not zone', async () => {
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

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))
    // expect(screen.findAllByText('AP Group')).toBeDisabled()
  })
  it('should handle sorting column for mac address', async () => {
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
      ...fakeIncidentApInfraWanthroughput,
      sliceType: 'zone'
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
    const apGroupList = await screen.findAllByText('AP Group')
    expect(apGroupList.length).toBeGreaterThan(0)
    const apGroup = apGroupList[apGroupList.length - 1]
    fireEvent.click(apGroup)
  })
  it('should handle sorting column for interface', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
      <Provider>
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput as Incident}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const interfaceList = await screen.findAllByText('Interface')
    expect(interfaceList.length).toBeGreaterThan(0)
    const interfaceCol = interfaceList[interfaceList.length - 1]
    fireEvent.click(interfaceCol)
  })
  it('should handle sorting column for WAN Link Capability', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
      <Provider>
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput as Incident}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const wanLinkCapList = await screen.findAllByText('WAN Link Capability')
    expect(wanLinkCapList.length).toBeGreaterThan(0)
    const wanLinkCap = wanLinkCapList[wanLinkCapList.length - 1]
    fireEvent.click(wanLinkCap)
  })
  it('should handle sorting column for Wan Link', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
      <Provider>
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput as Incident}/>
      </Provider>,
      {
        route: {
          path: '/t/tenantId/analytics/incidents',
          wrapRoutes: false
        }
      }
    )
    const wanLinkList = await screen.findAllByText('WAN Link')
    expect(wanLinkList.length).toBeGreaterThan(0)
    const wanLink = wanLinkList[wanLinkList.length - 1]
    fireEvent.click(wanLink)
  })
  it('should handle sorting column for event time', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedEntities', {
      data: { incident: { impactedEntities: expectedResult } }
    })
    render(
      <Provider>
        <WanthroughputTable incident={fakeIncidentApInfraWanthroughput as Incident}/>
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
