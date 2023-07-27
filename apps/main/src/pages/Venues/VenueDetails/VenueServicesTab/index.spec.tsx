/* eslint-disable max-len */
import { rest } from 'msw'

import { Tabs }                           from '@acx-ui/components'
import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockEdgeList } from './Firewall/__tests__/fixtures'

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
jest.mock('./VenueRogueAps', () => ({
  VenueRogueAps: () => (<div data-testid='VenueRogueAps' />)
}))

const mockedGetEdgeListFn = jest.fn()

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

    it('should not render firewall tab when there is no edge on venue', async () => {
      mockedGetEdgeListFn.mockReset()

      const mockNoEdgeList = {
        ...mockEdgeList,
        totalCount: 0,
        data: []
      }

      mockServer.use(
        rest.post(
          EdgeUrlsInfo.getEdgeList.url,
          (req, res, ctx) => {
            mockedGetEdgeListFn()
            return res(ctx.json(mockNoEdgeList))
          }
        )
      )

      render(
        <Provider>
          <VenueServicesTab />
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedGetEdgeListFn).toBeCalled()
      })

      expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(7)
    })

    it('should not render firewall tab when firewall service did not apply on edge', async () => {
      mockedGetEdgeListFn.mockReset()

      const mockNoFWEdgeList = {
        ...mockEdgeList,
        data: [
          {
            serialNumber: '0000000001',
            firewallId: ''
          }
        ]
      }

      mockServer.use(
        rest.post(
          EdgeUrlsInfo.getEdgeList.url,
          (req, res, ctx) => {
            mockedGetEdgeListFn()
            return res(ctx.json(mockNoFWEdgeList))
          }
        )
      )

      render(
        <Provider>
          <VenueServicesTab />
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedGetEdgeListFn).toBeCalled()
      })

      expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(7)
    })

    it('should correctly render', async () => {
      mockedGetEdgeListFn.mockReset()
      mockServer.use(
        rest.post(
          EdgeUrlsInfo.getEdgeList.url,
          (req, res, ctx) => {
            mockedGetEdgeListFn()
            return res(ctx.json(mockEdgeList))
          }
        )
      )
      render(
        <Provider>
          <VenueServicesTab />
        </Provider>, {
          route: { params }
        })

      await waitFor(() => {
        expect(mockedGetEdgeListFn).toBeCalled()
      })

      await waitFor(async () => {
        expect((await screen.findAllByTestId(/rc-tabpane-/)).length).toBe(7)
      })
    })
  })
})