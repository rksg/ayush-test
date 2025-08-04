import { graphql, rest } from 'msw'

import * as config                                from '@acx-ui/config'
import { useIsSplitOn, Features  }                from '@acx-ui/feature-toggle'
import { apApi, venueApi, networkApi, clientApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  ClientUrlsInfo,
  WifiUrlsInfo,
  Client,
  ClientStatistic,
  DpskUrls,
  SwitchRbacUrlsInfo,
  CommonRbacUrlsInfo,
  WifiRbacUrlsInfo,
  ClientInfo
} from '@acx-ui/rc/utils'
import { Provider, dataApi, dataApiURL, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import {
  clientList,
  clientApList,
  clientVenueList,
  clientNetworkList,
  clientReportList,
  eventMetaList,
  histClientList,
  GuestList,
  GuestClients,
  VenueList,
  dpskPassphraseClient,
  clientInfoList
} from '../../__tests__/fixtures'

import { ClientOverviewWidget } from './ClientOverviewWidget'
import { ClientProperties }     from './ClientProperties'
import { RbacClientProperties } from './RbacClientProperties'

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

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchClientListQuery: () => ({ data: {} }),
  useGetPrivacySettingsQuery: () => ({ data: [{
    featureName: 'APP_VISIBILITY',
    isEnabled: false
  }] })
}))

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

jest.mock('./TopApplications', () => ({
  TopApplications: () => <div data-testid={'rc-TopApplications'} title='TopApplications' />
}))

jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_RBAC_API)

const params = {
  tenantId: 'tenant-id',
  clientId: 'client-id'
}
const mockReqEventMeta = jest.fn()
const mockGetClientList = jest.fn()

describe('ClientOverviewTab root', () => {
  beforeEach(() => {
    mockReqEventMeta.mockClear()
    store.dispatch(dataApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => {
          mockReqEventMeta()
          return res(ctx.json(eventMetaList))
        }),
      rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiRbacUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonRbacUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(histClientList))),
      rest.post(ClientUrlsInfo.getClients.url,
        (_, res, ctx) => res(ctx.json(GuestClients))
      ),
      rest.post(CommonRbacUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json(VenueList))
      ),
      graphql.link(dataApiURL).query('ClientStatisics', (_, res, ctx) =>
        res(ctx.data({ client: clientReportList[0] })))
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
      mockServer.use(
        rest.post(ClientUrlsInfo.getClients.url,
          (_, res, ctx) => res(ctx.json({}))
        )
      )
      render(<Provider><ClientOverviewTab /></Provider>, {
        route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      await waitFor(() => expect(mockReqEventMeta).toBeCalledTimes(1))

      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('Disconnected')).toBeVisible()
      expect(await screen.findByText('30 m 3 s')).toBeVisible()
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
          connectedTimeStamp='2023-01-01T00:00:00Z'
        />
      </Provider>)
      expect(await screen.findByText('Current Status')).toBeVisible()
      expect(await screen.findByText('2.4 GHz')).toBeVisible()
      expect(await screen.findByText('5 GHz')).toBeVisible()
      expect(await screen.findByText('6 GHz')).toBeVisible()
    })

    it('should show N/A when app visibility is disabled', async () => {
      // Set up all required conditions for app visibility
      jest.requireMock('@acx-ui/config').get.mockImplementation((key: string) =>
        key === 'IS_MLISA_SA' ? false : undefined
      )
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.RA_PRIVACY_SETTINGS_APP_VISIBILITY_TOGGLE ? true : false
      )
      get.mockReturnValue('')

      const mockStats = {
        applications: 5,
        apsConnected: 1,
        avgRateBPS: '1000',
        userTrafficBytes: 5000,
        avgSessionLengthSeconds: 0,
        sessions: 0,
        userTraffic5GBytes: 0,
        userTraffic6GBytes: 0,
        userTraffic24GBytes: 0
      } as ClientStatistic

      render(<Provider>
        <ClientOverviewWidget
          clientStatistic={mockStats}
          clientStatus='Connected'
          clientDetails={clientList[0] as unknown as Client}
          filters={{ startDate: '', endDate: '', range: DateRange.last24Hours } as AnalyticsFilter}
          connectedTimeStamp='2023-01-01T00:00:00Z'
        />
      </Provider>)

      // Wait for the Applications section to be visible
      await waitFor(() => {
        expect(screen.getByText('Applications')).toBeVisible()
      })

      // Then check for N/A
      expect(screen.getByText('N/A')).toBeVisible()
    })

    it('should render ClientOverviewWidget on undefined ClientStatistic', async () => {
      render(<Provider>
        <ClientOverviewWidget
          clientStatistic={undefined as unknown as ClientStatistic}
          clientStatus='Connected'
          clientDetails={clientList[0] as unknown as Client}
          filters={{ startDate: '', endDate: '', range: DateRange.last24Hours } as AnalyticsFilter}
          connectedTimeStamp='2023-01-01T00:00:00Z'
        />
      </Provider>)
    })
  })
})

describe('ClientOverviewTab - ClientProperties', () => {
  beforeEach(() => {
    mockGetClientList.mockClear()
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList))),
      rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiRbacUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonRbacUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.post(ClientUrlsInfo.getClients.url,
        (_, res, ctx) => res(ctx.json(GuestClients))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      )
    )
  })

  describe('ClientProperties', () => {
    describe('Normal Client', () => {
      it('should render client correctly', async () => {
        render(<Provider>
          <RbacClientProperties
            clientDetails={clientInfoList[0] as ClientInfo}
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
          ...clientInfoList[0],
          networkInformation: {
            ...clientInfoList[0].networkInformation,
            vni: 9527
          }
        }
        render(<Provider>
          <RbacClientProperties
            clientDetails={clientData as unknown as ClientInfo}
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
          ...clientInfoList[0],
          osType: null,
          hostname: null,
          networkName: null,
          receiveSignalStrength_dBm: -70,
          snr_dB: null,
          wifiCallingClient: true,
          wifiCallingStatus: {
            carrierName: 'att1',
            qosPriority: 'WIFICALLING_PRI_VOICE',
            trafficFromClient: 121212,
            trafficToClient: 121212,
            totalTraffic: 242424
          }
        }

        mockServer.use(
          rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(CommonRbacUrlsInfo.getVenue.url,
            (_, res, ctx) => res(ctx.json(null)))
        )

        render(<Provider>
          <RbacClientProperties
            clientDetails={clientDetails as unknown as ClientInfo}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      })

      it('should render guest client correctly', async () => {
        const clientDetails = {
          ...clientInfoList[0],
          osType: 'apple',
          networkName: null,
          receiveSignalStrength_dBm: -90
        }

        mockServer.use(
          rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json({
              ...clientApList[0],
              name: null
            }))),
          rest.get(CommonRbacUrlsInfo.getVenue.url,
            (_, res, ctx) => res(ctx.json({
              ...clientVenueList[0],
              name: null
            }))),
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
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
              ...GuestList,
              data: [{
                ...GuestList.data[3],
                name: '24418cc316df',
                wifiNetworkId: '423c3673e74f44e69c0f3b35cd579ecc',
                clients: GuestClients.data
              }]
            }))),
          rest.post(
            SwitchRbacUrlsInfo.getSwitchClientList.url,
            (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
          )
        )
        render(<Provider>
          <RbacClientProperties
            clientDetails={clientDetails as unknown as ClientInfo}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })
        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
        expect(await screen.findByText('Guest Details')).toBeVisible()
        expect(await screen.findByText(GuestList.data[3].emailAddress)).toBeVisible()
        expect(await screen.findByText(GuestList.data[3].mobilePhoneNumber!)).toBeVisible()
        expect(await screen.findByText('a/n/ac/ax/be')).toBeVisible()
      })

      it('should render dpsk client correctly', async () => {
        const clientDetails = {
          ...clientInfoList[0],
          username: 'Fake User 1',
          osType: 'apple'
        }

        mockServer.use(
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk',
              dpskServiceProfileId: '123456789'
            }))
          ),
          rest.get(WifiUrlsInfo.queryDpskService.url.replace(':networkId', clientDetails.networkInformation.id),
            (_, res, ctx) => res(ctx.json({ id: 'fakeDpskServiceId' }))),
          rest.get(DpskUrls.getPassphraseClient.url.replace('?mac=:mac&networkId=:networkId', ''),
            (_, res, ctx) => res(ctx.json({ ...dpskPassphraseClient }))
          )
        )

        render(<Provider>
          <RbacClientProperties
            clientDetails={clientDetails as unknown as ClientInfo}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText(dpskPassphraseClient.username)).toBeVisible()
        expect(await screen.findByText('Captive Portal')).toBeVisible()
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
        venueName: 'UI-TEST-VENUE',
        username: 'Fake User 1'
      }

      it('should render historical client correctly', async () => {
        render(<Provider>
          <ClientProperties
            clientDetails={clientDetails as unknown as Client}
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
          rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json(null))),
          rest.get(CommonRbacUrlsInfo.getVenue.url,
            (_, res, ctx) => res(ctx.json(null)))
        )
        render(<Provider>
          <ClientProperties
            clientDetails={{
              ...clientDetails,
              disconnectTime: null,
              sessionDuration: null,
              ssid: null
            } as unknown as Client}
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
        mockServer.use(
          rest.get(WifiRbacUrlsInfo.getAp.url.replace('?operational=false', ''),
            (_, res, ctx) => res(ctx.json({
              ...clientApList[0],
              name: null
            }))),
          rest.get(CommonRbacUrlsInfo.getVenue.url,
            (_, res, ctx) => res(ctx.json({
              ...clientVenueList[0],
              name: null
            }))),
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
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
              ...GuestList,
              data: [{
                ...GuestList.data[3],
                name: '24418cc316df',
                wifiNetworkId: '423c3673e74f44e69c0f3b35cd579ecc',
                clients: GuestClients.data
              }]
            }))),
          rest.post(ClientUrlsInfo.getClients.url, (_, res, ctx) => {
            mockGetClientList()
            return res(ctx.json(GuestClients))
          }),
          rest.post(
            SwitchRbacUrlsInfo.getSwitchClientList.url,
            (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
          )
        )
        render(<Provider>
          <ClientProperties
            clientDetails={{
              ...clientDetails,
              ssid: null
            } as unknown as Client}
          />
        </Provider>, {
          route: {
            params,
            path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview'
          }
        })
        await waitFor(() => {
          expect(mockGetClientList).toBeCalledTimes(1)
        })
        expect(await screen.findByText('Client Details')).toBeVisible()
        expect(await screen.findByText('Last Session')).toBeVisible()
        expect(await screen.findByText('Guest Details')).toBeVisible()
        expect(await screen.findByText(clientList?.[0].apName)).toBeVisible()
        expect(await screen.findByText(clientList?.[0].venueName)).toBeVisible()
      })

      it('should render historical client (dpsk) correctly', async () => {
        mockServer.use(
          rest.get(WifiRbacUrlsInfo.getNetwork.url,
            (_, res, ctx) => res(ctx.json({
              ...clientNetworkList[0],
              type: 'dpsk',
              dpskServiceProfileId: '123456789'
            }))
          ),
          rest.post(CommonUrlsInfo.getGuestsList.url,
            (_, res, ctx) => res(ctx.json({
              ...GuestList,
              data: [{
                ...GuestList.data[3],
                name: '24418cc316df',
                wifiNetworkId: '423c3673e74f44e69c0f3b35cd579ecc',
                clients: GuestClients.data
              }]
            }))),
          rest.post(CommonRbacUrlsInfo.getVenues.url, (_, res, ctx) =>
            res(ctx.json(VenueList))
          ),
          rest.get(WifiUrlsInfo.queryDpskService.url.replace(':networkId', clientDetails.networkId),
            (_, res, ctx) => res(ctx.json({ id: 'fakeDpskServiceId' }))),
          rest.get(DpskUrls.getPassphraseClient.url.replace('?mac=:mac&networkId=:networkId', ''),
            (_, res, ctx) => res(ctx.json({ ...dpskPassphraseClient }))
          )
        )

        render(<Provider>
          <ClientProperties
            clientDetails={clientDetails as unknown as Client}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/t/users/wifi/clients/:clientId/details/overview' }
        })

        expect(await screen.findByText(dpskPassphraseClient.username)).toBeVisible()
        expect(await screen.findByText('NMS-app6-WLAN-QA')).toBeVisible()
      })

      it('should render correctly since clientStatus path parameter deprecated', async () => {
        store.dispatch(dataApi.util.resetApiState())
        mockServer.use(
          rest.post(ClientUrlsInfo.getClients.url,
            (_, res, ctx) => res(ctx.json({}))
          ),
          rest.post(CommonUrlsInfo.getHistoricalClientList.url,
            (_, res, ctx) => res(ctx.json(histClientList))
          ),
          graphql.link(dataApiURL).query('ClientStatisics', (_, res, ctx) =>
            res(ctx.data({ client: clientReportList[0] })))
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
