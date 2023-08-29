/* eslint-disable max-len */
import { rest } from 'msw'

import { Tabs }                                                from '@acx-ui/components'
import { useIsSplitOn, useIsTierAllowed }                      from '@acx-ui/feature-toggle'
import { EdgeDhcpUrls, EdgeUrlsInfo, NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                                            from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import { VenueServicesTab } from './'

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
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })

    describe('when there is no firewall and nsg data', () => {
      const mockedGetEdgeListFn = jest.fn()
      const mockedGetNsgListFn = jest.fn()
      const mockNoData = {
        totalCount: 0,
        data: []
      }
      beforeEach(() => {
        mockServer.use(
          rest.post(
            EdgeUrlsInfo.getEdgeList.url,
            (req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoData))
            }
          ),
          rest.post(
            NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
            (req, res, ctx) => {
              mockedGetNsgListFn()
              return res(ctx.json(mockNoData))
            }
          )
        )
      })

      it('should not render firewall and nsg tab when there is no edge on venue', async () => {
        render(
          <Provider>
            <VenueServicesTab />
          </Provider>, {
            route: { params }
          })

        await waitFor(() => expect(mockedGetEdgeListFn).toBeCalled())
        await waitFor(() => expect(mockedGetNsgListFn).toBeCalled())

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(6)
      })
    })

    describe('when there is firewall and nsg data', () => {
      const mockedGetEdgeListFn = jest.fn()
      const mockedGetEdgeDhcpFn = jest.fn()
      const mockedGetNsgListFn = jest.fn()
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
            (req, res, ctx) => {
              mockedGetEdgeListFn()
              return res(ctx.json(mockNoFWEdgeList))
            }
          ),
          rest.post(
            NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
            (req, res, ctx) => {
              mockedGetNsgListFn()
              return res(ctx.json(mockNsgList))
            }
          ),
          rest.get(
            EdgeDhcpUrls.getDhcpByEdgeId.url,
            (req, res, ctx) => {
              mockedGetEdgeDhcpFn()
              return res(ctx.json({ id: 'testDhcp' }))
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

        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(8)
      })
    })
  })
})
