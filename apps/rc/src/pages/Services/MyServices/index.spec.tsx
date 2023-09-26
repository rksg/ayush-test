import { rest } from 'msw'

import { DHCPUrls, DpskUrls, getSelectServiceRoutePath, MdnsProxyUrls, PortalUrlsInfo, WifiCallingUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { mockWifiCallingTableResult, mockedTableResult, dpskListResponse, mockedPortalList } from './__tests__/fixtures'

import MyServices from '.'



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
        (req, res, ctx) => res(ctx.json(mockWifiCallingTableResult))
      ),
      rest.post(
        MdnsProxyUrls.getEnhancedMdnsProxyList.url,
        (req, res, ctx) => {
          getEnhancedMdnsProxyRequestSpy()
          return res(ctx.json(mockedTableResult))
        }
      ),
      rest.post(
        DHCPUrls.getDHCPProfilesViewModel.url,
        (req, res, ctx) => res(ctx.json(mockedTableResult))
      ),
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(dpskListResponse))),
      rest.post(
        PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (req, res, ctx) => res(ctx.json(mockedPortalList))
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
})
