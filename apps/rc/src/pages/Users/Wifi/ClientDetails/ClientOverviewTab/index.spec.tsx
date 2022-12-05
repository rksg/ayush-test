import { rest } from 'msw'

import { apApi, venueApi, networkApi, clientApi } from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }           from '@acx-ui/rc/utils'
import { Provider, store }                        from '@acx-ui/store'
import {
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
  clientNetworkList,
  clientReportList,
  eventMetaList,
  histClientList
} from '../../__tests__/fixtures'

import { ClientOverviewTab } from '.'

const params = {
  tenantId: 'tenant-id',
  clientId: 'client-id'
}

async function checkDataVisible (asFragment) {
  expect(await screen.findByText('User Traffic')).toBeVisible()
  expect(await screen.findByText('141 KB')).toBeVisible()
  expect(await screen.findByText('User Traffic')).toBeVisible()
  expect(await screen.findByText('1.44 GB')).toBeVisible()
  expect(await screen.findByText('Applications')).toBeVisible()
  expect(await screen.findByText('73')).toBeVisible()
  expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
}

describe('ClientOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.get(CommonUrlsInfo.getClientDetails.url,
        (_, res, ctx) => res(ctx.json(clientList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(histClientList))),
      rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
        (_, res, ctx) => res(ctx.json(clientReportList[0]))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(apCaps)))
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render client correctly', async () => {
    const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Current Status')).toBeVisible()
    expect(await screen.findByText('Connected')).toBeVisible()
    await checkDataVisible(asFragment)
  })

  it('should handle error occurred', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )
    render(<Provider><ClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
    })
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should render historical client correctly', async () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
    const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Current Status')).toBeVisible()
    expect(await screen.findByText('Disconnected')).toBeVisible()
    await checkDataVisible(asFragment)
  })

  it('should render correctly when search parameters is disappeared', async () => {
    jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
    mockServer.use(
      rest.get(CommonUrlsInfo.getClientDetails.url,
        (_, res, ctx) => res(ctx.status(404), ctx.json({}))
      )
    )
    const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
      route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Current Status')).toBeVisible()
    expect(await screen.findByText('Disconnected')).toBeVisible()
    await checkDataVisible(asFragment)
  })
})