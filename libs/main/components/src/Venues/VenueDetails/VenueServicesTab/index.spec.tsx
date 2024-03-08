/* eslint-disable max-len */
import { rest } from 'msw'

import { Tabs }                                                               from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                           from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls, EdgeSdLanUrls, EdgeUrlsInfo, NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                                                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import { VenueServicesTab } from '.'

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
jest.mock('./NetworkSegmentation', () => ({
  NetworkSegmentation: () => (<div data-testid='NetworkSegmentation' />)
}))
jest.mock('./VenueRogueAps', () => ({
  VenueRogueAps: () => (<div data-testid='VenueRogueAps' />)
}))
jest.mock('./SdLan', () => ({
  default: () => <div data-testid='EdgeSdLan' />,
  __esModule: true
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
      jest.mocked(useIsTierAllowed).mockReturnValue(false)
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
    const mockedGetNsgListFn = jest.fn()
    const mockedGetSdLanListFn = jest.fn()

    beforeEach(() => {
      mockedGetEdgeListFn.mockReset()
      mockedGetEdgeDhcpFn.mockReset()
      mockedGetNsgListFn.mockReset()
      mockedGetSdLanListFn.mockReset()

      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })

    describe('when there is no firewall, nsg and SD-LAN data', () => {
      const mockNoData = {
        totalCount: 0,
        data: []
      }
      beforeEach(() => {
        mockServer.use(
          rest.post(
            EdgeUrlsInfo.getEdgeList.url,
            (_req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoData))
            }
          ),
          rest.post(
            NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
            (_req, res, ctx) => {
              mockedGetNsgListFn()
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

      it('should not render firewall, nsg and SD-LAN tab when there is no edge on venue', async () => {
        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
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
            firewallId: '123'
          }
        ]
      }
      const mockNsgList = {
        totalCount: 1,
        data: [{ id: 'testNsg' }]
      }
      beforeEach(() => {
        mockServer.use(
          rest.post(
            EdgeUrlsInfo.getEdgeList.url,
            (_req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoFWEdgeList))
            }
          ),
          rest.post(
            NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
            (_req, res, ctx) => {
              mockedGetNsgListFn()
              return res(ctx.json(mockNsgList))
            }
          ),
          rest.get(
            EdgeDhcpUrls.getDhcpByEdgeId.url,
            (_req, res, ctx) => {
              mockedGetEdgeDhcpFn()
              return res(ctx.json({ id: 'testDhcp' }))
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
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(9)
      })

      it('when only HA OFF, should not render EdgeDhcp and EdgeFirewall', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_HA_TOGGLE)

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).not.toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        // tab: DHCP - SmartEdge
        expect(screen.queryByTestId(/rc-tabpane-SmartEdge/)).toBeNull()
        expect(screen.queryByTestId(/rc-tabpane-Firewall/)).toBeNull()
      })

      it('when HA ON and DHCP_HA OFF, should not render EdgeDhcp', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_DHCP_HA_TOGGLE)

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).not.toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        expect(screen.queryByTestId(/rc-tabpane-SmartEdge/)).toBeNull()
      })

      // jest.mocked(useIsSplitOn).mockReturnValue(true)
      it('should render sdlan tab when sdlan-ha FF enabled, P1 FF disabled', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          ff !== Features.EDGES_SD_LAN_TOGGLE
        )

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(9)
      })

      it('should not trigger query when sdlan all FF are off', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff =>
          !(ff === Features.EDGES_SD_LAN_TOGGLE || ff === Features.EDGES_SD_LAN_HA_TOGGLE)
        )

        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())
        await waitFor(() => expect(mockedGetEdgeDhcpFn).toBeCalled())
        await waitFor(() => expect(mockedGetSdLanListFn).not.toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(8)
      })
    })
  })
})
