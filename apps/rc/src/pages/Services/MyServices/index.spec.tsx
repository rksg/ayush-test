import { rest } from 'msw'

import { Features, useIsSplitOn }                                                                                                                                                                                         from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                                                                                                                                          from '@acx-ui/rc/components'
import { DHCPUrls, DpskUrls, EdgeMdnsFixtures, EdgeMdnsProxyUrls, EdgeTnmServiceFixtures, EdgeTnmServiceUrls , getSelectServiceRoutePath, MdnsProxyUrls, PortalUrlsInfo, PropertyUrlsInfo, ServiceType, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                                                       from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import { mockWifiCallingTableResult, mockedTableResult, dpskListResponse, mockedPortalList } from './__tests__/fixtures'

import MyServices from '.'


jest.mock('../UnifiedServices/useUnifiedServiceListWithTotalCount', () => ({
  ...jest.requireActual('../UnifiedServices/useUnifiedServiceListWithTotalCount'),
  useDhcpConsolidationTotalCount: () => ({ data: { totalCount: 0 }, isFetching: false })
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))
const mockedUseDhcpStateMap = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useDhcpStateMap: () => mockedUseDhcpStateMap()
}))

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
const { mockTnmServiceDataList } = EdgeTnmServiceFixtures

describe('MyServices', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/:tenantId/t'
  const getEnhancedMdnsProxyRequestSpy = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        WifiCallingUrls.getEnhancedWifiCallingList.url,
        (_, res, ctx) => res(ctx.json(mockWifiCallingTableResult))
      ),
      rest.post(
        MdnsProxyUrls.getEnhancedMdnsProxyList.url,
        (_, res, ctx) => {
          getEnhancedMdnsProxyRequestSpy()
          return res(ctx.json(mockedTableResult))
        }
      ),
      rest.post(
        DHCPUrls.getDHCPProfilesViewModel.url,
        (_, res, ctx) => res(ctx.json(mockedTableResult))
      ),
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(dpskListResponse))),
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => res(ctx.json(mockedPortalList))
      ),
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({
          totalCount: mockEdgeMdnsViewDataList.length,
          page: 1,
          data: mockEdgeMdnsViewDataList
        }))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeTnmServiceList.url,
        (_, res, ctx) => res(ctx.json(mockTnmServiceDataList))
      ),
      rest.get(
        PropertyUrlsInfo.getResidentPortalList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({
          data: { totalCount: 0 }
        }))
      )
    )
  })

  beforeEach(() => {
    mockedUseDhcpStateMap.mockReturnValue({
      [ServiceType.DHCP]: true,
      [ServiceType.EDGE_DHCP]: false,
      [ServiceType.DHCP_CONSOLIDATION]: false
    })
  })

  afterEach(() => {
    getEnhancedMdnsProxyRequestSpy.mockClear()
  })

  it('should render My Services', async () => {
    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    const createPageLink = `/${params.tenantId}/t/` + getSelectServiceRoutePath()

    await waitFor(() => expect(getEnhancedMdnsProxyRequestSpy).toHaveBeenCalledTimes(1))
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add Service' })).toHaveAttribute('href', createPageLink)
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
  })

  it('should not render anything when FF is off', async () => {
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(screen.queryByText(/mDNS Proxy for RUCKUS Edge/)).toBeNull()
    expect(screen.queryByText(/Thirdparty Network Management/)).toBeNull()
  })

  it('should render Edge MDNS when FF is ON', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_MDNS_PROXY_TOGGLE)

    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('mDNS Proxy for RUCKUS Edge (2)')).toBeVisible()
  })

  it('should render Edge TNM SERVICE when FF is ON', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_THIRDPARTY_MGMT_TOGGLE)

    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Thirdparty Network Management (2)')).toBeVisible()
  })

  describe('Edge OLT', () => {
    it('should render Edge OLT when FF is ON', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)

      render(
        <Provider>
          <MyServices />
        </Provider>, {
          route: { params, path }
        }
      )

      await screen.findByText('NOKIA GPON Services')
    })

    it('should not render Edge OLT when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      render(
        <Provider>
          <MyServices />
        </Provider>, {
          route: { params, path }
        }
      )

      expect(screen.queryByText('NOKIA GPON Services')).toBeNull()
    })
  })

  it('should render DHCP Consolidation corredectly when FF is ON', async () => {
    mockedUseDhcpStateMap.mockReturnValue({
      [ServiceType.DHCP]: false,
      [ServiceType.EDGE_DHCP]: false,
      [ServiceType.DHCP_CONSOLIDATION]: true
    })

    render(
      <Provider>
        <MyServices />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(screen.queryByText(/DHCP for Wi-Fi/i)).toBeNull()
    expect(screen.queryByText(/DHCP for RUCKUS Edge/i)).toBeNull()
    expect(screen.getByText('DHCP (0)')).toBeInTheDocument()
  })
})
