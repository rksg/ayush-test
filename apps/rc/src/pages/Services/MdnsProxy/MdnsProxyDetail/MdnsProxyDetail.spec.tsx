import { rest } from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  MdnsProxyUrls,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  mockedApList,
  mockedEmptyApList,
  mockedGetApiResponse,
  mockedGetApiResponseWithoutAps
} from '../MdnsProxyForm/__tests__/fixtures'

import MdnsProxyDetail from './MdnsProxyDetail'

describe.skip('MdnsProxyDetail', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })


  beforeEach(() => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxy.url,
        (req, res, ctx) => {
          return res(ctx.json({ ...mockedGetApiResponse }))
        }
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedApList }))
      )
    )
  })

  it('should render the detail view without AP instances', async () => {
    mockServer.use(
      rest.get(
        MdnsProxyUrls.getMdnsProxy.url,
        (req, res, ctx) => res(ctx.json({ ...mockedGetApiResponseWithoutAps }))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedEmptyApList }))
      )
    )

    render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByText('Instances (0)')).toBeVisible()
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getServiceDetailsLink({
      type: ServiceType.MDNS_PROXY,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)

    const targetAp = mockedApList.data[0]
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetAp.name) })
    expect(targetRow).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('My Services')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <MdnsProxyDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'mDNS Proxy'
    })).toBeVisible()
  })
})
