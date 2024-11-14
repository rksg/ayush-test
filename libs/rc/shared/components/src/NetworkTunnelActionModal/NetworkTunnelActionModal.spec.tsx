import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { cloneDeep, find } from 'lodash'
import { rest }            from 'msw'

import { useIsSplitOn, Features }                                                        from '@acx-ui/feature-toggle'
import { softGreApi }                                                                    from '@acx-ui/rc/services'
import { EdgeSdLanFixtures, EdgePinFixtures, NetworkTypeEnum, SoftGreUrls, EdgePinUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { mockDeepNetworkList, mockSoftGreTable } from './__tests__/fixtures'
import { useEdgeMvSdLanData }                    from './useEdgeMvSdLanData'

import { NetworkTunnelActionModal, NetworkTunnelTypeEnum } from '.'

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

const { click } = userEvent

describe('NetworkTunnelModal', () => {
  beforeEach(() => {
    mockedActivateReq.mockReset()
    mockedDeactivateReq.mockReset()
    mockedGetVenueSdLanFn.mockReset()
    mockedOnFinish.mockReset()

    // eslint-disable-next-line max-len
    jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_SD_LAN_MV_TOGGLE)
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
            <NetworkTunnelActionModal
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
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        await waitFor(() => expect(localBreakout).not.toBeChecked())
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedDcSdlan.name} )` })
        expect(tunneling).toBeChecked()
        expect(tunneling).not.toBeDisabled()
        const destinationInfo = screen.getByText(/the destination cluster:/)
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
            <NetworkTunnelActionModal
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
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        await waitFor(() => expect(localBreakout).toBeChecked())
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedDcSdlan.name} )` })
        expect(tunneling).not.toBeChecked()
        expect(tunneling).not.toBeDisabled()
        const destinationInfo = screen.getByText(/the destination cluster:/)
        within(destinationInfo).getByText(new RegExp(mockedDcSdlan.edgeClusterName!))
        expect(screen.queryByRole('switch')).toBeNull()
        await click(tunneling)
        await click(screen.getByRole('button', { name: 'Apply' }))
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
            <NetworkTunnelActionModal
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
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        await waitFor(() => expect(localBreakout).toBeChecked())
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedDcSdlan.name} )` })
        expect(tunneling).not.toBeChecked()
        expect(tunneling).not.toBeDisabled()
      })
    })

    describe('DMZ case', () => {
      const sdlanVenueId = mockedSdLan.tunneledWlans![0].venueId
      const sdlanVenueName = mockedSdLan.tunneledWlans![0].venueName
      // eslint-disable-next-line max-len
      const targetNetwork = find(mockedNetworksData.response, { type: NetworkTypeEnum.CAPTIVEPORTAL })
      const defaultNetworkData = {
        id: targetNetwork!.id,
        type: targetNetwork!.type,
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
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        await waitFor(() => expect(localBreakout).not.toBeChecked())
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedSdLan.name} )` })
        expect(tunneling).toBeChecked()
        expect(tunneling).not.toBeDisabled()
        const destinationInfo = screen.getByText(/the destination cluster:/)
        within(destinationInfo).getByText(new RegExp(mockedSdLan.guestEdgeClusterName!))
        const fwdGuest = screen.getByRole('switch')
        expect(fwdGuest).toBeChecked()
        screen.getByText('Forward guest traffic to DMZ')
      })

      it('should change tunnel from local breakout into DMZ', async () => {
        const anotherGuestNetwork = { id: 'network_5', type: NetworkTypeEnum.CAPTIVEPORTAL }

        render(
          <Provider>
            <NetworkTunnelActionModal
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
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        await waitFor(() => expect(localBreakout).toBeChecked())
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedSdLan.name} )` })
        expect(tunneling).not.toBeChecked()
        expect(tunneling).not.toBeDisabled()
        expect(screen.queryByRole('switch')).toBeNull()

        // change to DC case
        await click(tunneling)
        const fwdGuest = await screen.findByRole('switch')
        await screen.findByText(/SE_Cluster 3/)
        // default enabled
        expect(fwdGuest).toBeChecked()
        expect(fwdGuest).not.toBeDisabled()
        await click(screen.getByRole('button', { name: 'Apply' }))
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
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedNoGuestNetwork.name} )` })
        await waitFor(() => expect(tunneling).toBeChecked())
        const fwdGuest = screen.getByRole('switch')
        expect(fwdGuest).not.toBeChecked()
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Apply' }))
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
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const fwdGuest = await screen.findByRole('switch')
        await waitFor(() => expect(fwdGuest).toBeChecked())
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: false
          },
          tunnelType: NetworkTunnelTypeEnum.SdLan
        })
      })

      it('should change tunnel from DMZ into local breakout', async () => {
        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
              cachedSoftGre={[]}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        await waitFor(async () => expect(await screen.findByRole('switch')).toBeChecked())
        await click(screen.getByRole('radio', { name: 'Local Breakout' }))
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedOnFinish).toBeCalledTimes(1)
        expect(mockedOnFinish.mock.calls[0][0]).toStrictEqual({
          sdLan: {
            isGuestTunnelEnabled: true
          },
          tunnelType: NetworkTunnelTypeEnum.None
        })
      })

      it('should greyout all option when network is the last one in SDLAN', async () => {
        const mockData = cloneDeep(mockedSdLan)
        // eslint-disable-next-line max-len
        mockData.tunneledWlans!.splice(mockData.tunneledWlans!.findIndex(i => i.networkId === 'network_1'), 1)

        jest.mocked(useEdgeMvSdLanData).mockReturnValue({ venueSdLan: mockData, isLoading: false })

        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        expect(await screen.findByRole('radio', { name: 'Local Breakout' })).toBeDisabled()
        expect(await screen.findByRole('radio', { name: /SD-LAN Tunneling/ })).toBeDisabled()
      })

      // eslint-disable-next-line max-len
      it('should NOT greyout all option when the network is not the last one network in SDLAN', async () => {
        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={jest.fn()}
              network={{
                id: 'tmpNetworkId',
                type: NetworkTypeEnum.CAPTIVEPORTAL,
                venueId: defaultNetworkData.venueId,
                venueName: defaultNetworkData.venueName
              }}
              onFinish={mockedOnFinish}
            />
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        expect(await screen.findByRole('radio', { name: 'Local Breakout' })).not.toBeDisabled()
        expect(await screen.findByRole('radio', { name: /SD-LAN Tunneling/ })).not.toBeDisabled()
      })
    })
  })

  describe('No existing SD-LAN', () => {
    beforeEach(() => {
      jest.mocked(useEdgeMvSdLanData).mockReturnValue({ isLoading: false })
    })
    it('should correctly display when no SDLAN run on this venue', async () => {
      const mockedNetworkData = {
        id: 'mocked-networkId',
        type: NetworkTypeEnum.CAPTIVEPORTAL,
        venueId: 'mock_venue',
        venueName: 'mock_venue_test'
      }

      render(
        <Provider>
          <NetworkTunnelActionModal
            visible={true}
            onClose={jest.fn()}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
      await waitFor(() => expect(localBreakout).toBeChecked())
      const tunneling = screen.getByRole('radio', { name: 'SD-LAN Tunneling' })
      expect(tunneling).not.toBeChecked()
      expect(tunneling).toBeDisabled()
      screen.getByText('See more information')
    })


    it('should do nothing when given network data is undefined', async () => {
      render(
        <Provider>
          <NetworkTunnelActionModal
            visible={true}
            onClose={jest.fn()}
            network={undefined}
            onFinish={mockedOnFinish}
            cachedSoftGre={[]}
          />
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await screen.findByRole('radio', { name: 'Local Breakout' })
      expect(mockedGetVenueSdLanFn).toBeCalledTimes(0)
      const venueNameSentence = screen.getByText(/Define how this network traffic/)
      // eslint-disable-next-line testing-library/no-node-access
      expect(venueNameSentence?.textContent)
        .toBe('Define how this network traffic will be tunnelled at venue "":')
    })
  })


  describe('SoftGRE', () => {
    const mockedGetFn = jest.fn()
    beforeEach(() => {
      jest.mocked(useEdgeMvSdLanData).mockReturnValue({ isLoading: false })
      mockedGetFn.mockClear()
      store.dispatch(softGreApi.util.resetApiState())
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_SOFTGRE_OVER_WIRELESS_TOGGLE)
      mockServer.use(
        rest.post(
          SoftGreUrls.getSoftGreViewDataList.url,
          (_, res, ctx) => {
            mockedGetFn()
            return res(ctx.json(mockSoftGreTable))
          }
        )
      )
    })
    it('should not display when SoftGRE run on this venue', async () => {
      const venueId = 'venueId-1'
      const networkId = 'network_1'
      const tenantId = 'tenantId-1'
      const mockedNetworkData = {
        id: networkId,
        venueId,
        type: NetworkTypeEnum.OPEN,
        venueName: 'mock_venue_test'
      }

      const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'
      const cachedSoftGre = [{
        venueId,
        networkIds: [networkId],
        profileId: '0d89c0f5596c4689900fb7f5f53a0859',
        profileName: 'softGreProfileName1'
      }]
      render(
        <Provider>
          <NetworkTunnelActionModal
            visible={true}
            onClose={() => {}}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={cachedSoftGre}
          />
        </Provider>,
        { route: { path: viewPath, params: { venueId, tenantId } } }
      )

      await checkPageLoaded(mockedNetworkData.venueName)
      const softGreTunneling = screen.getByRole('radio', { name: 'SoftGRE Tunneling' })
      await waitFor(() => expect(softGreTunneling).toBeChecked())
      const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
      expect(localBreakout).not.toBeChecked()
      const sdlanTunneling = screen.getByRole('radio', { name: 'SD-LAN Tunneling' })
      expect(sdlanTunneling).not.toBeChecked()
      await waitFor(() => expect(mockedGetFn).toBeCalled())
    })

    it('should correctly hidden when SoftGRE run on this venue (CAPTIVEPORTAL)', async () => {
      const venueId = 'venueId-1'
      const networkId = 'network_1'
      const tenantId = 'tenantId-1'
      const mockedNetworkData = {
        id: networkId,
        venueId,
        type: NetworkTypeEnum.CAPTIVEPORTAL,
        venueName: 'mock_venue_test'
      }

      const viewPath = '/:tenantId/t/venues/:venueId/venue-details/networks'
      const cachedSoftGre = [{
        venueId,
        networkIds: [networkId],
        profileId: '0d89c0f5596c4689900fb7f5f53a0859',
        profileName: 'softGreProfileName1'
      }]
      render(
        <Provider>
          <NetworkTunnelActionModal
            visible={true}
            onClose={() => {}}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
            cachedSoftGre={cachedSoftGre}
          />
        </Provider>,
        { route: { path: viewPath, params: { venueId, tenantId } } }
      )

      await checkPageLoaded(mockedNetworkData.venueName)
      const softGreTunneling = screen.queryByRole('radio', { name: 'SoftGRE Tunneling' })
      await waitFor(() => expect(softGreTunneling).toBeNull())
      const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
      expect(localBreakout).not.toBeChecked()
      await waitFor(() => expect(mockedGetFn).not.toBeCalled())
    })
  })

  describe('PIN', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)
      jest.mocked(useEdgeMvSdLanData).mockImplementation(() => ({ isLoading: false }))
    })

    it('should correctly dispaly for PIN', async () => {
      mockServer.use(
        rest.post(
          EdgePinUrls.getEdgePinStatsList.url,
          (_req, res, ctx) => res(ctx.json(mockPinStatsList))
        ))

      const targetNetwork = mockedNetworksData.response[0]

      render(
        <Provider>
          <NetworkTunnelActionModal
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
      expect(screen.queryByRole('radio', { name: 'Local Breakout' })).toBeNull()
      expect(screen.queryByRole('radio', { name: /SD-LAN/ })).toBeNull()
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
          <NetworkTunnelActionModal
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

      // wait for PIN query being triggered
      await screen.findByRole('img', { name: 'loader' })
      // eslint-disable-next-line max-len
      const sdlanRadio = await screen.findByRole('radio', { name: `SD-LAN Tunneling( ${mockedDcSdlan.name} )` })
      expect(sdlanRadio).not.toBeChecked()
      expect(sdlanRadio).toBeDisabled()
      await userEvent.hover(sdlanRadio)
      const tooltip = await screen.findByRole('tooltip', { hidden: true })
      expect(tooltip).toHaveTextContent('This network already used in Personal Identity Network')
    })
  })

})

const checkPageLoaded = async (venueName: string) => {
  await screen.findByText(venueName)
  await screen.findByRole('radio', { name: 'Local Breakout' })
}