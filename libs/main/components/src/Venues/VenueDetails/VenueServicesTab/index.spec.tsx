/* eslint-disable max-len */
import { rest } from 'msw'

import { Tabs }                                                                                         from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                                       from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls, EdgeGeneralFixtures, EdgePinFixtures, EdgePinUrls, EdgeSdLanUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { VenueServicesTab } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockPinStatsList } = EdgePinFixtures

jest.spyOn(Tabs, 'TabPane').mockImplementation((props) => {
  return <div data-testid={`rc-tabpane-${props.tab}`}>{props.children}</div>
})
jest.mock('./ClientIsolationAllowList', () => ({
  default: () => <div data-testid='ClientIsolationAllowList' />,
  __esModule: true
}))
jest.mock('./DHCPInstance', () => ({
  default: () => <div data-testid='DHCPInstance' />,
  __esModule: true
}))
jest.mock('./DHCPInstance/Edge', () => ({
  default: () => <div data-testid='EdgeDhcpTab' />,
  __esModule: true
}))
jest.mock('./Firewall', () => ({
  default: () => <div data-testid='EdgeFirewall' />,
  __esModule: true
}))
jest.mock('./MdnsProxyInstances', () => ({
  default: () => <div data-testid='MdnsProxyInstances' />,
  __esModule: true
}))
jest.mock('./MdnsProxyInstances/Edge', () => ({
  EdgeMdnsTab: () => <div data-testid='MdnsProxyInstances-Edge' />
}))
jest.mock('./Pin', () => ({
  EdgePin: () => (<div data-testid='EdgePin' />)
}))
jest.mock('./VenueRogueAps', () => ({
  VenueRogueAps: () => (<div data-testid='VenueRogueAps' />)
}))
jest.mock('./SdLan', () => ({
  default: () => <div data-testid='EdgeSdLan' />,
  __esModule: true
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

describe('Venue service tab', () => {
  let params: { tenantId: string, venueId: string }

  beforeEach(() => {
    params = {
      tenantId: 't-tenant',
      venueId: 't-venue'
    }
  })

  describe('when edge feature flag is off', () => {
    it('should not render edge related tab', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      render(
        <Provider>
          <VenueServicesTab />
        </Provider>, {
          route: { params }
        })

      expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(5)
    })
  })

  describe('when edge feature flag is on', () => {
    const mockedGetEdgeListFn = jest.fn()
    const mockedGetEdgeDhcpFn = jest.fn()
    const mockedGetPinListFn = jest.fn()
    const mockedGetSdLanListFn = jest.fn()

    beforeEach(() => {
      mockedGetEdgeListFn.mockReset()
      mockedGetEdgeDhcpFn.mockReset()
      mockedGetPinListFn.mockReset()
      mockedGetSdLanListFn.mockReset()
    })

    describe('when there is no firewall, PIN and SD-LAN data', () => {
      const mockNoData = {
        totalCount: 0,
        data: []
      }
      beforeEach(() => {
        jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_MDNS_PROXY_TOGGLE)

        mockServer.use(
          rest.post(
            EdgeUrlsInfo.getEdgeList.url,
            (_req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoData))
            }
          ),
          rest.post(
            EdgePinUrls.getEdgePinStatsList.url,
            (_req, res, ctx) => {
              mockedGetPinListFn()
              return res(ctx.json(mockNoData))
            }
          ),
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_req, res, ctx) => {
              mockedGetSdLanListFn()
              return res(ctx.json(mockNoData))
            }
          )
        )
      })

      it('should not render firewall, PIN and SD-LAN tab when there is no edge on venue', async () => {
        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(6)
      })
    })

    describe('when services data are ready', () => {
      const mockNoFWEdgeList = {
        totalCount: 0,
        data: [
          {
            serialNumber: '0000000001',
            firewallId: '123',
            clusterId: 'test-cluster'
          }
        ]
      }

      beforeEach(() => {
        jest.mocked(useIsTierAllowed).mockImplementation(ff =>
          ff === TierFeatures.EDGE_ADV || ff === TierFeatures.EDGE_MDNS_PROXY)
        jest.mocked(useIsSplitOn).mockReturnValue(true)

        mockServer.use(
          rest.post(
            EdgeUrlsInfo.getEdgeList.url,
            (_req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoFWEdgeList))
            }
          ),
          rest.post(
            EdgePinUrls.getEdgePinStatsList.url,
            (_req, res, ctx) => {
              mockedGetPinListFn()
              return res(ctx.json(mockPinStatsList))
            }
          ),
          rest.post(
            EdgeDhcpUrls.getDhcpStats.url,
            (_req, res, ctx) => {
              mockedGetEdgeDhcpFn()
              return res(ctx.json({ data: [{ id: 'testDhcp' }] }))
            }
          ),
          rest.post(
            EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
            (_req, res, ctx) => {
              mockedGetSdLanListFn()
              return res(ctx.json({ data: [{
                id: 'mocked-sd-lan-1',
                name: 'mocked_sdLan_1'
              }] }))
            }
          ),
          rest.post(
            EdgeUrlsInfo.getEdgeClusterStatusList.url,
            (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
          )
        )
      })

      it('should render all the tabs', async () => {
        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        await screen.findByTestId(/rc-tabpane-SD-LAN/)
        expect(screen.getByTestId(/rc-tabpane-mDNS Proxy/)).toBeVisible()
        expect(screen.getByTestId(/MdnsProxyInstances-Edge/)).toBeVisible()
        // including all first level and second level tabs
        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(11)
      })

      it('when only HA OFF, should not render EdgeDhcp and EdgeFirewall', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_HA_TOGGLE && ff !== Features.EDGE_MDNS_PROXY_TOGGLE)

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())
        expect(mockedGetEdgeDhcpFn).not.toBeCalled()
        await screen.findByTestId(/rc-tabpane-SD-LAN/)
        expect( screen.getAllByTestId(/rc-tabpane-/).length).toBe(7)
        // tab: DHCP - SmartEdge
        expect(screen.queryByTestId(/rc-tabpane-SmartEdge/)).toBeNull()
        expect(screen.queryByTestId(/rc-tabpane-Firewall/)).toBeNull()
      })

      it('when HA ON and DHCP_HA OFF, should not render EdgeDhcp', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_DHCP_HA_TOGGLE && ff !== Features.EDGE_MDNS_PROXY_TOGGLE)

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())
        expect(mockedGetEdgeDhcpFn).not.toBeCalled()
        await screen.findByTestId(/rc-tabpane-SD-LAN/)
        expect(screen.queryByTestId(/rc-tabpane-SmartEdge/)).toBeNull()
      })

      it('should render sdlan tab when sdlan-ha FF enabled, P1 FF disabled', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff !== Features.EDGES_SD_LAN_TOGGLE && ff !== Features.EDGE_MDNS_PROXY_TOGGLE
        )

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(9)
      })

      it('should not trigger query when sdlan all FF are off', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          !(ff === Features.EDGES_SD_LAN_TOGGLE || ff === Features.EDGES_SD_LAN_HA_TOGGLE || ff === Features.EDGE_SD_LAN_MV_TOGGLE)
          && ff !== Features.EDGE_MDNS_PROXY_TOGGLE
        )

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetPinListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        expect(mockedGetSdLanListFn).not.toBeCalled()
        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(8)
      })
    })
  })
})