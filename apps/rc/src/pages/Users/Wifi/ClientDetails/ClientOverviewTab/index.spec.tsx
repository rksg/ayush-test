import { rest } from 'msw'

import { AnalyticsFilter }                                                                      from '@acx-ui/analytics/utils'
import { apApi, venueApi, networkApi, clientApi }                                               from '@acx-ui/rc/services'
import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo, Client, ClientStatistic, getUrlForTest } from '@acx-ui/rc/utils'
import { Provider, store }                                                                      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  cleanup
} from '@acx-ui/test-utils'
import { DateRange } from '@acx-ui/utils'

import {
  apCaps,
  clientList,
  clientApList,
  clientVenueList,
  clientNetworkList,
  clientReportList,
  eventMetaList,
  histClientList,
  GuestClient
} from '../../__tests__/fixtures'

import { ClientOverviewWidget } from './ClientOverviewWidget'

import { ClientOverviewTab } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  TrafficByBand: () => <div data-testid={'analytics-TrafficByBand'} title='TrafficByBand' />,
  TrafficByUsage: () => <div data-testid={'analytics-TrafficByUsage'} title='TrafficByUsage' />,
  ClientHealth: () => <div data-testid='anayltics-ClientHealth' title='ClientHealth' />
}))

jest.mock('./TopApplications', () => ({
  TopApplications: () => <div data-testid={'rc-TopApplications'} title='TopApplications' />
}))

const params = {
  tenantId: 'tenant-id',
  clientId: 'client-id'
}

async function checkFragment (asFragment: () => DocumentFragment) {
  const fragment = asFragment()
  // eslint-disable-next-line testing-library/no-node-access
  fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
  fragment.querySelector('div[size-sensor-id]')?.removeAttribute('size-sensor-id')
  expect(fragment).toMatchSnapshot()
}

describe('ClientOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-12-14T01:20:00+10:00')))

    mockServer.use(
      rest.get(ClientUrlsInfo.getClientDetails.url,
        (_, res, ctx) => res(ctx.json(clientList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
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
    cleanup()
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('OverviewWidget', () => {
    it('should render client info correctly', async () => {
      const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
      })

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Connected')).toBeVisible()
      checkFragment(asFragment)
    })

    it('should handle error occurred', async () => {
      mockServer.use(
        rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        ),
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        )
      )
      render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
      })
      // TODO
      // expect(await screen.findByText('Server Error')).toBeVisible()
    })

    it('should render historical client info correctly', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
      const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Disconnected')).toBeVisible()
      checkFragment(asFragment)
    })

    it('should render correctly when search parameters is disappeared', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
      mockServer.use(
        rest.get(ClientUrlsInfo.getClientDetails.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        )
      )
      const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Disconnected')).toBeVisible()
      checkFragment(asFragment)
    })

    it('should render ClientOverviewWidget on undefined fields for ClientStatistic', async () => {
      const emptyStats = {
        applications: undefined,
        apsConnected: undefined,
        avgRateBPS: undefined,
        avgSessionLengthSeconds: undefined,
        sessions: undefined,
        userTraffic5GBytes: undefined,
        userTraffic6GBytes: undefined,
        userTraffic24GBytes: undefined,
        userTrafficBytes: undefined
      } as unknown as ClientStatistic
      render(<Provider>
        <ClientOverviewWidget
          clientStatistic={emptyStats}
          clientStatus='Connected'
          clientDetails={clientList[0] as unknown as Client}
          filters={{ startDate: '', endDate: '', range: DateRange.last24Hours } as AnalyticsFilter}
        />
      </Provider>)
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('2.4 GHz')).toBeVisible()
      expect(await screen.findByText('5 GHz')).toBeVisible()
      expect(await screen.findByText('6 GHz')).toBeVisible()
    })

    it('should render ClientOverviewWidget on undefined ClientStatistic', async () => {
      render(<Provider>
        <ClientOverviewWidget
          clientStatistic={undefined as unknown as ClientStatistic}
          clientStatus='Connected'
          clientDetails={clientList[0] as unknown as Client}
          filters={{ startDate: '', endDate: '', range: DateRange.last24Hours } as AnalyticsFilter}
        />
      </Provider>)
      // expect(await screen.findByText('Server Error')).toBeVisible()
    })
  })

  describe('ClientProperties', () => {
    describe('Normal Client', () => {
      it('should render client correctly', async () => {
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it('should render client without some data correctly', async () => {
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })

        mockServer.use(
          rest.get(ClientUrlsInfo.getClientDetails.url,
            (_, res, ctx) => res(ctx.json({
              ...clientList[0],
              osType: null,
              hostname: null,
              networkName: null,
              receiveSignalStrength_dBm: -70,
              snr_dB: null,
              noiseFloor_dBm: null,
              wifiCallingClient: true,
              wifiCallingCarrierName: 'att1',
              wifiCallingQosPriority: 'WIFICALLING_PRI_VOICE',
              wifiCallingTotal: 242424,
              wifiCallingTx: 121212,
              wifiCallingRx: 121212
            }))),
          rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(getUrlForTest(CommonUrlsInfo.getVenue),
            (_, res, ctx) => res(ctx.json(null)))
        )

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it('should render guest client correctly', async () => {
        mockServer.use(
          rest.get(ClientUrlsInfo.getClientDetails.url,
            (_, res, ctx) => res(ctx.json({
              ...clientList[0],
              osType: 'apple',
              networkName: null,
              noiseFloor_dBm: -60,
              receiveSignalStrength_dBm: -90
            }))),
          rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json({
              ...clientApList[0],
              name: null
            }))),
          rest.get(getUrlForTest(CommonUrlsInfo.getVenue),
            (_, res, ctx) => res(ctx.json({
              ...clientVenueList[0],
              name: null
            }))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'guest',
              name: null
            }))),
          rest.post(CommonUrlsInfo.getGuestsList.url,
            (_, res, ctx) => res(ctx.json({
              ...GuestClient,
              data: [{
                ...GuestClient.data[3]
              }]
            })))
        )
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it.skip('should render dpsk client correctly', async () => {
        mockServer.use(
          rest.get(ClientUrlsInfo.getClientDetails.url,
            (_, res, ctx) => res(ctx.json({
              ...clientList[0],
              osType: 'apple',
              receiveSignalStrength_dBm: null
            }))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk'
            }))
          )
        )
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })
    })

    describe('Historical Client', () => {
      it('should render historical client correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })
        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it('should render historical client without some data correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        mockServer.use(
          rest.post(CommonUrlsInfo.getHistoricalClientList.url,
            (_, res, ctx) => res(ctx.json({
              ...histClientList,
              data: [{
                ...histClientList.data[0],
                disconnectTime: null,
                sessionDuration: null,
                ssid: null
              }]
            }))),
          rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(getUrlForTest(CommonUrlsInfo.getVenue),
            (_, res, ctx) => res(ctx.json(null)))
        )
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })
        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it('should render historical client (guest) correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        mockServer.use(
          rest.post(CommonUrlsInfo.getHistoricalClientList.url,
            (_, res, ctx) => res(ctx.json({
              ...histClientList,
              data: [{
                ...histClientList.data[0],
                ssid: null
              }]
            }))),
          rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json({
              ...clientApList[0],
              name: null
            }))),
          rest.get(getUrlForTest(CommonUrlsInfo.getVenue),
            (_, res, ctx) => res(ctx.json({
              ...clientVenueList[0],
              name: null
            }))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'guest',
              name: null
            }))),
          rest.post(CommonUrlsInfo.getGuestsList.url,
            (_, res, ctx) => res(ctx.json({
              ...GuestClient,
              data: [{
                ...GuestClient.data[3]
              }]
            })))
        )
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: {
            params,
            path: '/:tenantId/users/wifi/clients/:clientId/details/overview',
            search: '?clientStatus=historical'
          }
        })

        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it.skip('should render historical client (dpsk) correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        mockServer.use(
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk'
            }))
          )
        )
        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })
        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })

      it.skip('should render correctly when search parameters is disappeared', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
        mockServer.use(
          rest.get(ClientUrlsInfo.getClientDetails.url,
            (_, res, ctx) => res(ctx.status(404), ctx.json({}))
          )
        )

        const { asFragment } = render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/users/wifi/clients/:clientId/details/overview' }
        })
        await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
        checkFragment(asFragment)
      })
    })
  })
})
