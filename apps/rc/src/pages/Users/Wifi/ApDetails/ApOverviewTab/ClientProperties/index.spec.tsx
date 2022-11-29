import { rest } from 'msw'

import { apApi, venueApi, networkApi, clientApi }       from '@acx-ui/rc/services'
import { CommonUrlsInfo, ClientUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import {
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
} from '../../../../__tests__/fixtures'

import { ClientProperties } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const params = {
  tenantId: 'tenant-id',
  userId: 'user-id'
}

describe('ClientProperties', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(clientApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())

    mockServer.use(
      rest.get(ClientUrlsInfo.getClientDetails.url,
        (_, res, ctx) => res(ctx.json(clientList[0]))),
      rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(clientApList[0]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clientNetworkList[0]))),
      rest.get(CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(clientVenueList[0]))),
      rest.post(CommonUrlsInfo.getHistoricalClientList.url,
        (_, res, ctx) => res(ctx.json(histClientList ))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventMetaList)))
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal Client', () => {
    it('should render client correctly', async () => {
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Connection')).toBeVisible()
      expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render client without some data correctly', async () => {
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
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
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(null)))
      )

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Connection')).toBeVisible()
      expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
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
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json({
            ...clientVenueList[0],
            name: null
          }))),
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.json({
            ...clientNetworkList[0],
            type: 'guest',
            name: null
          }))
        )
      )
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Connection')).toBeVisible()
      expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      expect(await screen.findByText('Guest Details')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render dpsk client correctly', async () => {
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
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })

      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Connection')).toBeVisible()
      expect(await screen.findByText('Operational Data (Current)')).toBeVisible()
      expect(await screen.findByText('DPSK Passphrase Details')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('Historical Client', () => {
    it('should render historical client correctly', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Last Session')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
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
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json(null)))
      )
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Last Session')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
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
        rest.get(CommonUrlsInfo.getVenue.url,
          (_, res, ctx) => res(ctx.json({
            ...clientVenueList[0],
            name: null
          }))),
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.json({
            ...clientNetworkList[0],
            type: 'guest',
            name: null
          }))
        )
      )
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: {
          params,
          path: '/:tenantId/users/aps/:userId/details/overview',
          search: '?clientStatus=historical'
        }
      })

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Last Session')).toBeVisible()
      expect(await screen.findByText('Guest Details')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render historical client (dpsk) correctly', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('historical')
      mockServer.use(
        rest.get(WifiUrlsInfo.getNetwork.url,
          (_, res, ctx) => res(ctx.json({
            ...clientNetworkList[0],
            type: 'dpsk'
          }))
        )
      )
      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Last Session')).toBeVisible()
      expect(await screen.findByText('DPSK Passphrase Details')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })

    it('should render correctly when search parameters is disappeared', async () => {
      jest.spyOn(URLSearchParams.prototype, 'get').mockReturnValue('')
      mockServer.use(
        rest.get(ClientUrlsInfo.getClientDetails.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({}))
        )
      )

      const { asFragment } = render(<Provider><ClientProperties /></Provider>, {
        route: { params, path: '/:tenantId/users/aps/:userId/details/overview' }
      })
      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Client Details')).toBeVisible()
      expect(await screen.findByText('Last Session')).toBeVisible()
      expect(await screen.findByText('WiFi Calling Details')).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})