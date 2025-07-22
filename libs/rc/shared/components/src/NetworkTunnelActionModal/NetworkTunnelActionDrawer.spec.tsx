import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { cloneDeep, find } from 'lodash'
import { rest }            from 'msw'

import { useIsSplitOn, Features }                                           from '@acx-ui/feature-toggle'
import { softGreApi }                                                       from '@acx-ui/rc/services'
import { EdgeSdLanFixtures, EdgePinFixtures, NetworkTypeEnum, EdgePinUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { mockDeepNetworkList } from './__tests__/fixtures'
import { useEdgeMvSdLanData }  from './useEdgeMvSdLanData'

import { NetworkTunnelActionDrawer, NetworkTunnelTypeEnum, SoftGreNetworkTunnel } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockPinStatsList } = EdgePinFixtures

const mockedNetworksData = mockDeepNetworkList
const mockedSdLan = mockedMvSdLanDataList[0]
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('./EdgeSdLanSelectOptionL2greContent', () => ({
  EdgeSdLanSelectOptionL2greContent: jest.fn(() => <div>EdgeSdLanSelectOptionL2greContent</div>)
}))
jest.mock('./EdgeSdLanSelectOptionEnhanced', () => ({
  EdgeSdLanSelectOptionEnhanced: jest.fn(() => <div>EdgeSdLanSelectOptionEnhanced</div>)
}))
jest.mock('./WifiSoftGreSelectOption', () => ({
  __esModule: true,
  default: jest.fn(() => <div>WifiSoftGreSelectOption</div>)
}))

const mockedActivateReq = jest.fn()
const mockedDeactivateReq = jest.fn()
const mockedGetVenueSdLanFn = jest.fn()
const mockedOnFinish = jest.fn()
jest.mock('./useEdgeMvSdLanData', () => ({
  ...jest.requireActual('./useEdgeMvSdLanData'),
  useEdgeMvSdLanData: jest.fn().mockReturnValue({
    venueSdLan: undefined
  })
}))

jest.mock('../ApCompatibility', () => ({
  ...jest.requireActual('../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

const { click } = userEvent
const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'

describe('NetworkTunnelDrawer', () => {
  beforeEach(() => {
    mockedActivateReq.mockReset()
    mockedDeactivateReq.mockReset()
    mockedGetVenueSdLanFn.mockReset()
    mockedOnFinish.mockReset()

    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  describe('SD-LAN exist', () => {
    describe('DC case', () => {
      const mockedDcSdlan = cloneDeep(mockedSdLan)
      mockedDcSdlan.isGuestTunnelEnabled = false
      mockedDcSdlan.tunneledGuestWlans = []

      // eslint-disable-next-line max-len
      const sdlanVenueId = mockedDcSdlan.tunneledWlans![0].venueId
      const sdlanVenueName = mockedDcSdlan.tunneledWlans![0].venueName

      beforeEach(() => {
        jest.mocked(useEdgeMvSdLanData).mockImplementation(() => ({
          venueSdLan: mockedDcSdlan,
          isLoading: false
        }))
      })

      it('should correctly render DC case', async () => {
        const targetNetwork = mockedNetworksData.response[0]

        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={{
                id: targetNetwork.id,
                type: targetNetwork!.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
        await userEvent.click(tunnelingMethod)
        const sdlanOption = await screen.findByTestId('sd-lan-option')
        expect(sdlanOption).not.toHaveClass('ant-select-item-option-disabled')
        await userEvent.click(sdlanOption)

        const destinationInfo = screen.getByText(/Destination cluster:/)
        within(destinationInfo).getByText(new RegExp(mockedDcSdlan.edgeClusterName!))
        expect(screen.queryByRole('switch')).toBeNull()
        expect(screen.queryByText('Forward guest traffic to DMZ')).toBeNull()

        // should not have PIN note when pin FF is not ON
        expect(screen.queryByRole(/please go to the PIN wizard/)).toBeNull()
      })

      it('should change tunnel from local breakout into DC', async () => {
        const targetNetwork = mockedNetworksData.response[1]

        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={{
                id: targetNetwork.id,
                type: targetNetwork.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
        await userEvent.click(tunnelingMethod)

        const sdlanOption = await screen.findByTestId('sd-lan-option')
        expect(sdlanOption).not.toHaveClass('ant-select-item-option-disabled')
        await userEvent.click(sdlanOption)

        const destinationInfo = screen.getByText(/Destination cluster:/)
        within(destinationInfo).getByText(new RegExp(mockedDcSdlan.edgeClusterName!))
        expect(screen.queryByRole('switch')).toBeNull()

        await click(screen.getByRole('button', { name: 'Add' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: false
          },
          tunnelType: NetworkTunnelTypeEnum.SdLan
        })
      })

      it('should not greyout by isPinNetwork when PIN FF is OFF', async () => {
        const targetNetwork = mockedNetworksData.response[1]

        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={{
                id: targetNetwork.id,
                type: targetNetwork.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              isPinNetwork
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
        await userEvent.click(tunnelingMethod)
        const sdlanOption = await screen.findByTestId('sd-lan-option')
        expect(sdlanOption).not.toHaveClass('ant-select-item-option-disabled')
      })
    })

    describe('DMZ case', () => {
      const sdlanVenueId = mockedSdLan.tunneledWlans![0].venueId
      const sdlanVenueName = mockedSdLan.tunneledWlans![0].venueName
      // eslint-disable-next-line max-len
      const captivePortalNetwork = find(mockedNetworksData.response, { type: NetworkTypeEnum.CAPTIVEPORTAL })
      const defaultNetworkData = {
        id: captivePortalNetwork!.id,
        type: captivePortalNetwork!.type,
        venueId: sdlanVenueId,
        venueName: sdlanVenueName
      }

      beforeEach(() => {
        jest.mocked(useEdgeMvSdLanData).mockReturnValue({
          venueSdLan: mockedSdLan,
          isLoading: false
        })
      })

      it('should correctly render DMZ case', async () => {
        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
        expect(tunnelingMethod).toBeDisabled()

        const fwdGuest = screen.getByRole('switch')
        await userEvent.click(fwdGuest)

        screen.getByText('Forward guest traffic to DMZ')
      })

      it('should set tunnel to DMZ', async () => {
        const anotherGuestNetwork = { id: 'network_5', type: NetworkTypeEnum.CAPTIVEPORTAL }

        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={{
                id: anotherGuestNetwork.id,
                type: anotherGuestNetwork.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        screen.getByRole('combobox', { name: 'Tunneling Method' })

        // change to DC case
        const fwdGuest = await screen.findByRole('switch')
        // default enabled
        expect(fwdGuest).toBeChecked()
        expect(fwdGuest).not.toBeDisabled()

        await click(screen.getByRole('button', { name: 'Add' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: true
          },
          tunnelType: NetworkTunnelTypeEnum.SdLan
        })
      })

      it('should change tunnel from DC into DMZ', async () => {
        const mockedNoGuestNetwork = cloneDeep(mockedSdLan)
        mockedNoGuestNetwork.tunneledGuestWlans = []
        jest.mocked(useEdgeMvSdLanData).mockReturnValue({
          venueSdLan: mockedNoGuestNetwork,
          isLoading: false
        })

        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        screen.getByRole('combobox', { name: 'Tunneling Method' })

        const fwdGuest = screen.getByRole('switch')
        expect(fwdGuest).not.toBeChecked()
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Add' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: true
          },
          tunnelType: NetworkTunnelTypeEnum.SdLan
        })
      })

      it('should change tunnel from DMZ into DC', async () => {
        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        screen.getByRole('combobox', { name: 'Tunneling Method' })

        const fwdGuest = await screen.findByRole('switch')
        await waitFor(() => expect(fwdGuest).toBeChecked())
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Add' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: false
          },
          tunnelType: NetworkTunnelTypeEnum.SdLan
        })
      })

      // eslint-disable-next-line max-len
      it('should NOT greyout all option when the network is not the last one network in SDLAN', async () => {
        render(
          <Provider>
            <NetworkTunnelActionDrawer
              visible={true}
              onClose={jest.fn()}
              network={{
                id: 'tmpNetworkId',
                type: NetworkTypeEnum.DPSK,
                venueId: defaultNetworkData.venueId,
                venueName: defaultNetworkData.venueName
              }}
              onFinish={mockedOnFinish}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
        await userEvent.click(tunnelingMethod)
        const sdlanOption = await screen.findByTestId('sd-lan-option')
        expect(sdlanOption).not.toHaveClass('ant-select-item-option-disabled')
      })
    })
  })

  describe('No existing SD-LAN', () => {
    beforeEach(() => {
      jest.mocked(useEdgeMvSdLanData).mockReturnValue({ isLoading: false })
    })
    it('should NOT be able to select SD-LAN when no SDLAN run on this venue', async () => {
      const mockedNetworkData = {
        id: 'mocked-networkId',
        type: NetworkTypeEnum.CAPTIVEPORTAL,
        venueId: 'mock_venue',
        venueName: 'mock_venue_test'
      }

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
      await userEvent.click(tunnelingMethod)
      const sdlanOption = await screen.findByTestId('sd-lan-option')
      expect(sdlanOption).toHaveClass('ant-select-item-option-disabled')
    })

    it('should do nothing when given network data is undefined', async () => {
      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={undefined}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      // await screen.findByRole('radio', { name: 'Local Breakout' })
      expect(mockedGetVenueSdLanFn).toBeCalledTimes(0)
      const venueNameSentence = screen.getByText(/Define how this network traffic/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(venueNameSentence?.textContent)
        .toBe('Define how this network traffic will be tunneled at venue.')
    })
  })

  describe('SoftGRE', () => {
    const venueId = 'venueId-1'
    const networkId = 'network_1'
    const tenantId = 'tenantId-1'
    const mockedDefaultNetworkData_softGre = {
      id: networkId,
      venueId,
      type: NetworkTypeEnum.OPEN,
      venueName: 'mock_venue_test'
    }

    beforeEach(() => {
      jest.mocked(useEdgeMvSdLanData).mockReturnValue({ isLoading: false })
      store.dispatch(softGreApi.util.resetApiState())
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff =>
        ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE
        || ff === Features.RBAC_OPERATIONS_API_TOGGLE
        || ff === Features.WIFI_R370_TOGGLE)
    })

    it('should correctly activate SoftGRE', async () => {
      const cachedSoftGre = [] as SoftGreNetworkTunnel[]

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedDefaultNetworkData_softGre}
            onFinish={mockedOnFinish}
            cachedSoftGre={cachedSoftGre}
          />
        </Provider>,
        { route: { path: viewPath, params: { venueId, tenantId } } }
      )

      await checkPageLoaded(mockedDefaultNetworkData_softGre.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
      await userEvent.click(tunnelingMethod)
      await userEvent.click(await screen.findByTestId('softgre-option'))

      await click(screen.getByRole('button', { name: 'Add' }))
      expect(mockedOnFinish).toBeCalledTimes(1)
      const [firstCall] = mockedOnFinish.mock.calls
      expect(firstCall[0]).toStrictEqual({
        tunnelType: NetworkTunnelTypeEnum.SoftGre
      })
    })

    it('should not display when SoftGRE run on this venue', async () => {
      const cachedSoftGre = [{
        venueId,
        networkIds: [networkId],
        profileId: '0d89c0f5596c4689900fb7f5f53a0859',
        profileName: 'softGreProfileName1'
      }]
      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedDefaultNetworkData_softGre}
            onFinish={mockedOnFinish}
            cachedSoftGre={cachedSoftGre}
          />
        </Provider>,
        { route: { path: viewPath, params: { venueId, tenantId } } }
      )
      await checkPageLoaded(mockedDefaultNetworkData_softGre.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
      await userEvent.click(tunnelingMethod)
      await userEvent.click(await screen.findByTestId('softgre-option'))

      expect(await screen.findByTestId('ApCompatibilityToolTip')).toBeVisible()
      expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
    })

    it('should correctly hidden when SoftGRE run on this venue (CAPTIVEPORTAL)', async () => {
      const venueId = 'venueId-1'
      const networkId = 'network_1'
      const tenantId = 'tenantId-1'
      const mockedNetworkData = {
        ...mockedDefaultNetworkData_softGre,
        type: NetworkTypeEnum.CAPTIVEPORTAL
      }

      const cachedSoftGre = [{
        venueId,
        networkIds: [networkId],
        profileId: '0d89c0f5596c4689900fb7f5f53a0859',
        profileName: 'softGreProfileName1'
      }]
      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={cachedSoftGre}
          />
        </Provider>,
        { route: { path: viewPath, params: { venueId, tenantId } } }
      )

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })

      expect(await screen.findByTestId('ApCompatibilityToolTip')).toBeVisible()
      expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()

      await userEvent.click(tunnelingMethod)
      await userEvent.click(await screen.findByTestId('softgre-option'))

      await waitFor(() => expect(screen.queryByRole('combobox', { name: 'SoftGRE Profile' }))
        .toBeNull())
    })

    it('SD-LAN should be selected by default when network is captive portal', async () => {
      const mockedNetworkData = {
        ...mockedDefaultNetworkData_softGre,
        type: NetworkTypeEnum.CAPTIVEPORTAL
      }

      jest.mocked(useEdgeMvSdLanData).mockReturnValue({
        venueSdLan: mockedSdLan,
        isLoading: false
      })

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })

      await waitFor(() => expect(tunnelingMethod).toBeDisabled())
      // SD-LAN should be selected by default
      expect(await screen.findByText('SD-LAN')).toBeVisible()

      jest.mocked(useEdgeMvSdLanData).mockClear()
    })

    // eslint-disable-next-line max-len
    it('SD-LAN should NOT be selected by default when network is captive portal and the venue does not associated with SD-LAN', async () => {
      const mockedNetworkData = {
        ...mockedDefaultNetworkData_softGre,
        type: NetworkTypeEnum.CAPTIVEPORTAL
      }

      jest.mocked(useEdgeMvSdLanData).mockReturnValue({
        venueSdLan: undefined,
        isLoading: false
      })

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })

      expect(tunnelingMethod).not.toBeDisabled()
      expect(await screen.findByText('Select...')).toBeVisible()

      // SD-LAN should Not be selected by default
      expect(screen.queryByText('SD-LAN')).toBeNull()

      jest.mocked(useEdgeMvSdLanData).mockClear()
    })
  })

  describe('PIN', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff: Features) => {
        return ff === Features.EDGE_PIN_HA_TOGGLE
      })
      jest.mocked(useEdgeMvSdLanData).mockImplementation(() => ({ isLoading: false }))
    })

    it('should correctly display for PIN', async () => {
      mockServer.use(
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_req, res, ctx) => res(ctx.json(mockPinStatsList))
        ))

      const targetNetwork = mockedNetworksData.response[0]

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={{
              id: targetNetwork.id,
              type: targetNetwork!.type,
              venueId: mockPinStatsList.data[0].venueId,
              venueName: mockPinStatsList.data[0].venueName
            }}
            onFinish={mockedOnFinish}
          />
        </Provider>,
        { route: { params: { tenantId: 't-id' } } }
      )

      await screen.findByText(/please go to the PIN wizard/)
    })

    it('should greyout SD-LAN option when network is selected for PIN', async () => {
      mockServer.use(
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_req, res, ctx) => res(ctx.json({ data: [] }))
        ))

      const targetNetwork = mockedNetworksData.response[1]

      const mockedDcSdlan = cloneDeep(mockedSdLan)
      mockedDcSdlan.isGuestTunnelEnabled = false
      mockedDcSdlan.tunneledGuestWlans = []

      jest.mocked(useEdgeMvSdLanData).mockReturnValue({
        venueSdLan: mockedDcSdlan,
        isLoading: false
      })

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible
            onClose={jest.fn()}
            network={{
              id: targetNetwork.id,
              type: targetNetwork.type,
              venueId: mockedDcSdlan.tunneledWlans![0].venueId,
              venueName: mockedDcSdlan.tunneledWlans![0].venueName
            }}
            isPinNetwork
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
      await userEvent.click(tunnelingMethod)
      const sdlanOption = await screen.findByTestId('sd-lan-option')
      expect(sdlanOption).toHaveClass('ant-select-item-option-disabled')
    })
  })

  describe('SD-LAN selection drawer', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockImplementation((ff: Features) => {
        return ff === Features.EDGE_SDLAN_SELECTION_ENHANCE_TOGGLE
      })
    })

    it('should be able to select SD-LAN when no SDLAN run on this venue', async () => {
      const mockedNetworkData = {
        id: 'mocked-networkId',
        type: NetworkTypeEnum.DPSK,
        venueId: 'mock_venue',
        venueName: 'mock_venue_test'
      }

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })
      await userEvent.click(tunnelingMethod)
      const sdlanOption = await screen.findByTestId('sd-lan-option')
      expect(sdlanOption).not.toHaveClass('ant-select-item-option-disabled')
    })
    it('SD-LAN should be selected by default when network is captive portal', async () => {
      const mockedNetworkData = {
        id: 'mocked-networkId',
        type: NetworkTypeEnum.CAPTIVEPORTAL,
        venueId: 'mock_venue',
        venueName: 'mock_venue_test'
      }

      jest.mocked(useEdgeMvSdLanData).mockReturnValue({
        venueSdLan: undefined,
        isLoading: false
      })

      render(
        <Provider>
          <NetworkTunnelActionDrawer
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const tunnelingMethod = screen.getByRole('combobox', { name: 'Tunneling Method' })

      await waitFor(() => expect(tunnelingMethod).toBeDisabled())
      // SD-LAN should be selected by default
      expect(await screen.findByText('SD-LAN')).toBeVisible()
      expect(await screen.findByText('EdgeSdLanSelectOptionEnhanced')).toBeVisible()

      jest.mocked(useEdgeMvSdLanData).mockClear()
    })
  })
})

const checkPageLoaded = async (venueName: string) => {
  expect(await screen.findByText('Tunnel: ' + venueName)).toBeInTheDocument()
}