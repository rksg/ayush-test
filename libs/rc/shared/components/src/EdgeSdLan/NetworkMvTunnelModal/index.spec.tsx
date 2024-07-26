import { within }          from '@testing-library/react'
import userEvent           from '@testing-library/user-event'
import { cloneDeep, find } from 'lodash'
import { rest }            from 'msw'

import { EdgeSdLanFixtures, EdgeSdLanUrls, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import { mockDeepNetworkList } from '../__tests__/fixtures'

import { EdgeMvSdLanContext, EdgeMvSdLanContextType } from './EdgeMvSdLanContextProvider'

import { NetworkMvTunnelModal } from '.'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

const mockedActivateReq = jest.fn()
const mockedDeactivateReq = jest.fn()
const mockedGetVenueSdlanFn = jest.fn()
const { click } = userEvent
const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const mockedNetworksData = mockDeepNetworkList
const mockedSdLan = mockedMvSdLanDataList[0]

const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList,
  getVenueSdLan: mockedGetVenueSdlanFn
} as EdgeMvSdLanContextType

describe('Edge SD-LAN multi venue NetworkTunnelModal', () => {
  beforeEach(() => {
    mockedActivateReq.mockReset()
    mockedDeactivateReq.mockReset()
    mockedGetVenueSdlanFn.mockReset()

    mockServer.use(
      rest.put(
        EdgeSdLanUrls.activateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockedActivateReq(req.params, req.body)
          return res(ctx.status(202))
        }
      ),
      rest.delete(
        EdgeSdLanUrls.deactivateEdgeMvSdLanNetwork.url,
        (req, res, ctx) => {
          mockedDeactivateReq(req.params)
          return res(ctx.status(202))
        }
      )
    )
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
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={{
                  id: targetNetwork.id,
                  type: targetNetwork!.type,
                  venueId: sdlanVenueId,
                  venueName: sdlanVenueName
                }}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        expect(localBreakout).not.toBeChecked()
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
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={{
                  id: targetNetwork.id,
                  type: targetNetwork.type,
                  venueId: sdlanVenueId,
                  venueName: sdlanVenueName
                }}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        expect(localBreakout).toBeChecked()
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedDcSdlan.name} )` })
        expect(tunneling).not.toBeChecked()
        expect(tunneling).not.toBeDisabled()
        const destinationInfo = screen.getByText(/the destination cluster:/)
        within(destinationInfo).getByText(new RegExp(mockedDcSdlan.edgeClusterName!))
        expect(screen.queryByRole('switch')).toBeNull()
        await click(tunneling)
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedActivateReq).toBeCalledTimes(1)
        expect(mockedActivateReq).toBeCalledWith({
          serviceId: mockedDcSdlan.id,
          venueId: sdlanVenueId,
          wifiNetworkId: targetNetwork.id
        }, { isGuestTunnelUtilized: false })
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
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={defaultNetworkData}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        expect(localBreakout).not.toBeChecked()
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
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={{
                  id: anotherGuestNetwork.id,
                  type: anotherGuestNetwork.type,
                  venueId: sdlanVenueId,
                  venueName: sdlanVenueName
                }}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        expect(localBreakout).toBeChecked()
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedSdLan.name} )` })
        expect(tunneling).not.toBeChecked()
        expect(tunneling).not.toBeDisabled()
        expect(screen.queryByRole('switch')).toBeNull()

        // change to DC case
        await click(tunneling)
        const fwdGuest = screen.getByRole('switch')
        // default enabled
        expect(fwdGuest).toBeChecked()
        expect(fwdGuest).not.toBeDisabled()
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedActivateReq).toBeCalledTimes(1)
        expect(mockedActivateReq).toBeCalledWith({
          serviceId: mockedSdLan.id,
          venueId: sdlanVenueId,
          wifiNetworkId: anotherGuestNetwork.id
        }, { isGuestTunnelUtilized: true })
      })

      it('should change tunnel from DC into DMZ', async () => {
        const mockedNoGuestNetwork = cloneDeep(mockedSdLan)
        mockedNoGuestNetwork.tunneledGuestWlans = []
        mockedGetVenueSdlanFn.mockReturnValue(mockedNoGuestNetwork)

        render(
          <Provider>
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={defaultNetworkData}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(defaultNetworkData.venueName)
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedNoGuestNetwork.name} )` })
        expect(tunneling).toBeChecked()
        const fwdGuest = screen.getByRole('switch')
        expect(fwdGuest).not.toBeChecked()
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedActivateReq).toBeCalledTimes(1)
        expect(mockedActivateReq).toBeCalledWith({
          serviceId: mockedNoGuestNetwork.id,
          venueId: sdlanVenueId,
          wifiNetworkId: targetNetwork!.id
        }, { isGuestTunnelUtilized: true })
      })

      it('should change tunnel from DC into DMZ and greyout', async () => {
        render(
          <Provider>
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={{
                  ...defaultNetworkData,
                  venueId: 'mock_venue_3',
                  venueName: 'Mocked-Venue-3'
                }}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded('Mocked-Venue-3')
        const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
        expect(localBreakout).toBeChecked()
        // eslint-disable-next-line max-len
        const tunneling = screen.getByRole('radio', { name: `SD-LAN Tunneling( ${mockedSdLan.name} )` })
        await click(tunneling)
        expect(tunneling).toBeChecked()
        const fwdGuest = screen.getByRole('switch')
        expect(fwdGuest).toBeChecked()
        expect(fwdGuest).toBeDisabled()
      })

      it('should change tunnel from DMZ into DC', async () => {
        render(
          <Provider>
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={defaultNetworkData}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        const fwdGuest = await screen.findByRole('switch')
        expect(fwdGuest).toBeChecked()
        await click(fwdGuest)
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedActivateReq).toBeCalledTimes(1)
        expect(mockedActivateReq).toBeCalledWith({
          serviceId: mockedSdLan.id,
          venueId: sdlanVenueId,
          wifiNetworkId: targetNetwork!.id
        }, { isGuestTunnelUtilized: false })
      })

      it('should change tunnel from DMZ into local breakout', async () => {
        render(
          <Provider>
            <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
              <NetworkMvTunnelModal
                visible={true}
                onClose={() => {}}
                network={defaultNetworkData}
              />
            </EdgeMvSdLanContext.Provider>
          </Provider>, { route: { params: { tenantId: 't-id' } } })

        await checkPageLoaded(sdlanVenueName)
        expect(await screen.findByRole('switch')).toBeChecked()
        await click(screen.getByRole('radio', { name: 'Local Breakout' }))
        await click(screen.getByRole('button', { name: 'Apply' }))
        expect(mockedDeactivateReq).toBeCalledTimes(1)
        expect(mockedDeactivateReq).toBeCalledWith({
          serviceId: mockedSdLan.id,
          venueId: sdlanVenueId,
          wifiNetworkId: targetNetwork!.id
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
          <EdgeMvSdLanContext.Provider value={edgeMvSdlanContextValues}>
            <NetworkMvTunnelModal
              visible={true}
              onClose={() => {}}
              network={mockedNetworkData}
            />
          </EdgeMvSdLanContext.Provider>
        </Provider>, { route: { params: { tenantId: 't-id' } } })

      await checkPageLoaded(mockedNetworkData.venueName)
      const localBreakout = screen.getByRole('radio', { name: 'Local Breakout' })
      expect(localBreakout).toBeChecked()
      const tunneling = screen.getByRole('radio', { name: 'SD-LAN Tunneling' })
      expect(tunneling).not.toBeChecked()
      expect(tunneling).toBeDisabled()
      screen.getByText('See more information')
    })
  })
})

const checkPageLoaded = async (venueName: string) => {
  await screen.findByText(new RegExp(`will be tunnelled at venue "${venueName}"`))
  await screen.findByRole('radio', { name: 'Local Breakout' })
}