import { rest } from 'msw'

import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  apCaps,
  clientList,
  clientApList,
  clientVenueList,
  clientReportList,
  clientNetworkList,
  eventMetaList,
  histClientList
} from '../__tests__/fixtures'

import ApDetails from '.'

describe('ApDetails', () => {
  mockServer.use(
    rest.get(ClientUrlsInfo.getClientDetails.url,
      (_, res, ctx) => res(ctx.json(clientList[0]))),
    rest.get(WifiUrlsInfo.getAp.url,
      (_, res, ctx) => res(ctx.json(clientApList[0]))),
    rest.get(WifiUrlsInfo.getNetwork.url,
      (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
    rest.get(CommonUrlsInfo.getVenue.url,
      (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
    rest.post(CommonUrlsInfo.getHistoricalClientList.url,
      (_, res, ctx) => res(ctx.json(histClientList ))),
    rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
      (_, res, ctx) => res(ctx.json(clientReportList[0]))),
    rest.post(CommonUrlsInfo.getEventListMeta.url,
      (_, res, ctx) => res(ctx.json(eventMetaList))),
    rest.get(WifiUrlsInfo.getApCapabilities.url,
      (_, res, ctx) => res(ctx.json(apCaps)))
  )

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('tab', { name: 'Troubleshooting' }))
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      clientId: 'user-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/:activeTab/:clientId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

})
