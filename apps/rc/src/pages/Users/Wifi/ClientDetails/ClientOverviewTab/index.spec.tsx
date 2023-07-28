import { rest } from 'msw'

import { AnalyticsFilter }                        from '@acx-ui/analytics/utils'
import { apApi, venueApi, networkApi, clientApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  ClientUrlsInfo,
  WifiUrlsInfo,
  Client,
  ClientStatistic,
  getUrlForTest,
  DpskUrls
} from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
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
  GuestClient,
  dpskPassphraseClient
} from '../../__tests__/fixtures'

import { ClientOverviewWidget } from './ClientOverviewWidget'
import { ClientProperties }     from './ClientProperties'

import { ClientOverviewTab } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  TrafficByBand: () => <div data-testid={'analytics-TrafficByBand'} title='TrafficByBand' />,
  TrafficByUsage: () => <div data-testid={'analytics-TrafficByUsage'} title='TrafficByUsage' />,
  ClientHealth: () => <div data-testid='anayltics-ClientHealth' title='ClientHealth' />
}))

jest.mock('socket.io-client')

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getJwtTokenPayload: () => ({ tenantId: 'tenantId' })
}))

jest.mock('./TopApplications', () => ({
  TopApplications: () => <div data-testid={'rc-TopApplications'} title='TopApplications' />
}))

const params = {
  tenantId: 'tenant-id',
  clientId: 'client-id'
}

describe('ClientOverviewTab', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-console
    // console.log('beforeEach')
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList))),
      rest.get(ClientUrlsInfo.getClientDetails.url,
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
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(apCaps)))
    )
  })

  describe('ClientOverviewTab', () => {
    it('should render client info correctly', async () => {
      render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
      })
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Connected')).toBeVisible()
    })

    it('should render historical client info correctly', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
      render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Disconnected')).toBeVisible()
    })

    it.skip('should render correctly when search parameters is disappeared', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
      mockServer.use(
        rest.get(ClientUrlsInfo.getClientDetails.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        )
      )
      render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Disconnected')).toBeVisible()
    })
  })

  describe('OverviewWidget', () => {
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
    })
  })
})

describe('ClientOverviewTab - ClientProperties', () => {
  beforeEach(() => {
    // eslint-disable-next-line no-console
    // console.log('beforeEach')
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.get(WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(apCaps)))
    )
  })

  describe('ClientProperties', () => {
    // TODO: match snapshot
    describe('Normal Client', () => {
      it('should render client correctly', async () => {
        render(<Provider>
          <ClientProperties
            clientStatus='connected'
            clientDetails={clientList[0]}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
        expect(screen.queryByText('VNI')).toBeNull()
      })

      it('should render client VNI correctly', async () => {
        const clientData = {
          ...clientList[0],
          vni: 9527
        }
        render(<Provider>
          <ClientProperties
            clientStatus='connected'
            clientDetails={clientData}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('VNI')).toBeVisible()
        expect(await screen.findByText('9527')).toBeVisible()
      })

      it('should render client without some data correctly', async () => {
        const clientDetails = {
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
        }

        mockServer.use(
          rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(getUrlForTest(CommonUrlsInfo.getVenue),
            (_, res, ctx) => res(ctx.json(null)))
        )

        render(<Provider>
          <ClientProperties
            clientStatus='connected'
            clientDetails={clientDetails}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      })

      it('should render guest client correctly', async () => {
        const clientDetails = {
          ...clientList[0],
          osType: 'apple',
          networkName: null,
          noiseFloor_dBm: -60,
          receiveSignalStrength_dBm: -90
        }

        mockServer.use(
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
              name: null,
              guestPortal: {
                guestNetworkType: 'GuestPass'
              }
            }))),
          rest.post(CommonUrlsInfo.getGuestsList.url,
            (_, res, ctx) => res(ctx.json({
              ...GuestClient,
              data: [{
                ...GuestClient.data[3],
                name: '24418cc316df',
                networkId: '423c3673e74f44e69c0f3b35cd579ecc'
              }]
            })))
        )
        render(<Provider>
          <ClientProperties
            clientStatus='connected'
            clientDetails={clientDetails}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })
        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
        expect(await screen.findByText('Guest Details')).toBeVisible()
        expect(await screen.findByText(GuestClient.data[3].emailAddress)).toBeVisible()
        expect(await screen.findByText(GuestClient.data[3].mobilePhoneNumber)).toBeVisible()
      })

      it('should render dpsk client correctly', async () => {
        const clientDetails = {
          ...clientList[0],
          osType: 'apple',
          receiveSignalStrength_dBm: null
        }

        mockServer.use(
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk',
              dpskServiceProfileId: '123456789'
            }))
          ),
          rest.post(DpskUrls.getPassphraseClient.url,
            (_, res, ctx) => res(ctx.json({ ...dpskPassphraseClient }))
          )
        )

        render(<Provider>
          <ClientProperties
            clientStatus='connected'
            clientDetails={clientDetails}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText(dpskPassphraseClient.username)).toBeVisible()
        expect(await screen.findByRole('link', { name: dpskPassphraseClient.clientMac[0] })).toBeVisible()
      })
    })

    describe('Historical Client', () => {
      const clientDetails = {
        bssid: '28:b3:71:a8:78:51',
        clientIP: '10.206.1.137',
        clientMac: '92:37:9d:40:3d:bd',
        disconnectTime: '1669277258',
        hostname: '92:37:9d:40:3d:bd',
        id: 'd47626f6206040c8925822acf4253bc9',
        osType: 'iOS Phone',
        serialNumber: '422039000230',
        sessionDuration: '1803',
        ssid: 'NMS-app6-WLAN-QA',
        userId: '',
        venueId: '87c982325ef148a2b7cefe652384d3ca',
        apName: 'UI team ONLY',
        isApExists: true,
        isClientExists: false,
        isVenueExists: true,
        networkId: '0189575828434f94a7c0b0e611379d26',
        venueName: 'UI-TEST-VENUE'
      }

      it('should render historical client correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        render(<Provider>
          <ClientProperties
            clientStatus='historical'
            clientDetails={clientDetails}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })
        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Last Session')).toBeVisible()
        expect(await screen.findByText(clientList?.[0].apName)).toBeVisible()
        expect(await screen.findByText(clientList?.[0].venueName)).toBeVisible()
        expect(await screen.findByText(histClientList?.data?.[0].ssid)).toBeVisible()
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
        render(<Provider>
          <ClientProperties
            clientStatus='historical'
            clientDetails={{
              ...clientDetails,
              disconnectTime: null,
              sessionDuration: null,
              ssid: null
            }}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Last Session')).toBeVisible()
        expect(await screen.findByText(clientList?.[0].apName)).toBeVisible()
        expect(await screen.findByText(clientList?.[0].venueName)).toBeVisible()
      })

      it('should render historical client (guest) correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')

        mockServer.use(
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
              name: '24418cc316df',
              guestPortal: {
                guestNetworkType: 'GuestPass'
              }
            }))),
          rest.post(CommonUrlsInfo.getGuestsList.url,
            (_, res, ctx) => res(ctx.json({
              ...GuestClient,
              data: [{
                ...GuestClient.data[3],
                name: '24418cc316df',
                networkId: '423c3673e74f44e69c0f3b35cd579ecc'
              }]
            })))
        )
        render(<Provider>
          <ClientProperties
            clientStatus='historical'
            clientDetails={{
              ...clientDetails,
              ssid: null
            }}
          />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview',
            search: '?clientStatus=historical'
          }
        })
        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Last Session')).toBeVisible()
        expect(await screen.findByText('Guest Details')).toBeVisible()
        expect(await screen.findByText(clientList?.[0].apName)).toBeVisible()
        expect(await screen.findByText(clientList?.[0].venueName)).toBeVisible()
      })

      it('should render historical client (dpsk) correctly', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
        mockServer.use(
          rest.get(WifiUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk',
              dpskServiceProfileId: '123456789'
            }))
          ),
          rest.post(DpskUrls.getPassphraseClient.url,
            (_, res, ctx) => res(ctx.json({ ...dpskPassphraseClient }))
          )
        )

        render(<Provider>
          <ClientProperties
            clientStatus='historical'
            clientDetails={clientDetails}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText(dpskPassphraseClient.username)).toBeVisible()
        expect(await screen.findByRole('link', { name: dpskPassphraseClient.clientMac[0] })).toBeVisible()
        expect(await screen.findByText('NMS-app6-WLAN-QA')).toBeVisible()
      })

      it('should render correctly when search parameters is disappeared', async () => {
        jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
        mockServer.use(
          rest.get(ClientUrlsInfo.getClientDetails.url,
            (_, res, ctx) => res(ctx.status(404), ctx.json({}))
          ),
          rest.post(CommonUrlsInfo.getHistoricalStatisticsReportsV2.url,
            (_, res, ctx) => res(ctx.json(clientReportList[0]))
          ),
          rest.post(CommonUrlsInfo.getHistoricalClientList.url,
            (_, res, ctx) => res(ctx.json(histClientList))
          )
        )

        render(<Provider><ClientOverviewTab /></Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Last Session')).toBeVisible()
        expect(await screen.findByText(clientList?.[0].apName)).toBeVisible()
        expect(await screen.findByText(clientList?.[0].venueName)).toBeVisible()
        expect(await screen.findByText(histClientList?.data?.[0].ssid)).toBeVisible()
      })
    })
  })
})
