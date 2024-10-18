import { rest } from 'msw'

import { Features }                                                                                                                           from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                                                                              from '@acx-ui/rc/components'
import { DHCPUrls, DpskUrls, EdgeMdnsFixtures, EdgeMdnsProxyUrls, getSelectServiceRoutePath, MdnsProxyUrls, PortalUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'


import { mockWifiCallingTableResult, mockedTableResult, dpskListResponse, mockedPortalList } from './__tests__/fixtures'

import MyServices from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))
const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures
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
      )
    )
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
})
