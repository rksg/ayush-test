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
  clientList,
  clientApList,
  clientVenueList,
  clientNetworkList,
  eventMetaList,
  histClientList
} from '../../__tests__/fixtures'

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
    rest.post(CommonUrlsInfo.getHistoricalClientDetails.url,
      (_, res, ctx) => res(ctx.json(histClientList ))),
    rest.post(CommonUrlsInfo.getEventListMeta.url,
      (_, res, ctx) => res(ctx.json(eventMetaList)))
  )

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'overview'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/aps/:userId/details/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('tab', { name: 'Troubleshooting' }))
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/aps/:userId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/aps/:userId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'timeline'
    }
    const { asFragment } = render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/aps/:userId/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      userId: 'user-id',
      activeTab: 'not-exist'
    }
    render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/:tenantId/users/aps/:userId/details/:activeTab' }
    })
    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })

})