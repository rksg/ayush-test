import { waitFor, within } from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { cloneDeep, find } from 'lodash'

import { EdgeSdLanFixtures, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mockDeepNetworkList } from '../__tests__/fixtures'

import { NetworkTunnelActionModal, NetworkTunnelTypeEnum } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(true)
}))

const mockedActivateReq = jest.fn()
const mockedDeactivateReq = jest.fn()
const mockedGetVenueSdlanFn = jest.fn()
const mockedOnFinish = jest.fn()
jest.mock('./useEdgeMvSdlanData', () => ({
  ...jest.requireActual('./useEdgeMvSdlanData'),
  useEdgeMvSdlanData: () => ({
    getVenueSdLan: mockedGetVenueSdlanFn
  })
}))

const { click } = userEvent
const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const mockedNetworksData = mockDeepNetworkList
const mockedSdLan = mockedMvSdLanDataList[0]

describe('NetworkTunnelModal', () => {
  beforeEach(() => {
    mockedActivateReq.mockReset()
    mockedDeactivateReq.mockReset()
    mockedGetVenueSdlanFn.mockReset()
    mockedOnFinish.mockReset()
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
        mockedGetVenueSdlanFn.mockReturnValue(mockedDcSdlan)
      })

      it('should correctly render DC case', async () => {
        const targetNetwork = mockedNetworksData.response[0]

        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={() => {}}
              network={{
                id: targetNetwork.id,
                type: targetNetwork!.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
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
      })

      it('should change tunnel from local breakout into DC', async () => {
        const targetNetwork = mockedNetworksData.response[1]

        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={() => {}}
              network={{
                id: targetNetwork.id,
                type: targetNetwork.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
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
        mockedGetVenueSdlanFn.mockReturnValue(mockedSdLan)
      })

      it('should correctly render DMZ case', async () => {
        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={() => {}}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
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
              onClose={() => {}}
              network={{
                id: anotherGuestNetwork.id,
                type: anotherGuestNetwork.type,
                venueId: sdlanVenueId,
                venueName: sdlanVenueName
              }}
              onFinish={mockedOnFinish}
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
        mockedGetVenueSdlanFn.mockReturnValue(mockedNoGuestNetwork)

        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={() => {}}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
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

      // TODO: shoud add back when `popup confirm dialog: ACX-58399` ready
      // it('should change tunnel from DC into DMZ and popup conflict', async () => {
      //   render(
      //     <Provider>
      //       <NetworkTunnelActionModal
      //         visible={true}
      //         onClose={() => {}}
      //         network={{
      //           ...defaultNetworkData,
      //           venueId: 'mock_venue_3',
      //           venueName: 'Mocked-Venue-3'
      //         }}
      //         onFinish={mockedOnFinish}
      //       />
      //     </Provider>, { route: { params: { tenantId: 't-id' } } })

      //   await checkPageLoaded('Mocked-Venue-3')
      //   const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
      //   await waitFor(() => expect(localBreakout).toBeChecked())
      //   // eslint-disable-next-line max-len
      //   const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedSdLan.name} )` })
      //   await click(tunneling)
      //   expect(tunneling).toBeChecked()
      //   const fwdGuest = screen.getByRole('switch')
      //   expect(fwdGuest).toBeChecked()
      //   expect(fwdGuest).toBeDisabled()
      // })

      it('should change tunnel from DMZ into DC', async () => {
        render(
          <Provider>
            <NetworkTunnelActionModal
              visible={true}
              onClose={() => {}}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
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
              onClose={() => {}}
              network={defaultNetworkData}
              onFinish={mockedOnFinish}
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
    })
  })

  describe('No existing SD-LAN', () => {
    beforeEach(() => {
      mockedGetVenueSdlanFn.mockReturnValue(undefined)
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
            onClose={() => {}}
            network={mockedNetworkData}
            onFinish={mockedOnFinish}
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
  })
})

const checkPageLoaded = async (venueName: string) => {
  await screen.findByText(venueName)
  await screen.findByRole('radio', { name: 'Local Breakout' })
}