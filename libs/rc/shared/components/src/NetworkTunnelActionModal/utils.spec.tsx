import { Provider } from 'react-redux'

import { Features }                                                                     from '@acx-ui/feature-toggle'
import { EdgeSdLanFixtures, NetworkTunnelSdLanAction, NetworkTypeEnum, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { store }                                                                        from '@acx-ui/store'
import { renderHook }                                                                   from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import { NetworkTunnelActionForm, NetworkTunnelTypeEnum }   from './types'
import { mergeSdLanCacheAct, useUpdateNetworkTunnelAction } from './utils'
const { mockedMvSdLanDataList } = EdgeSdLanFixtures

const mockedToggleNetworkFn = jest.fn()
jest.mock('../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../EdgeSdLan/useEdgeSdLanActions'),
  useEdgeMvSdLanActions: () => ({
    toggleNetwork: mockedToggleNetworkFn
  })
}))

const mockedToggleNetworkChangeFn = jest.fn()
const mockedDeactivateNetwork = jest.fn()
const mockedActivateNetwork = jest.fn()
jest.mock('@acx-ui/edge/components', () => {
  const actualModule = jest.requireActual('@acx-ui/edge/components')
  return {
    ...actualModule,
    useEdgeSdLanActions: () => ({
      toggleNetworkChange: (
        serviceId: string,
        venueId: string,
        networkId: string,
        currentTunnelProfileId: string,
        originTunnelProfileId: string | undefined,
        cb?: () => void
      ) => {
        mockedToggleNetworkChangeFn(
          serviceId,
          venueId,
          networkId,
          currentTunnelProfileId,
          originTunnelProfileId,
          cb
        )

        const isChangeTunneling = currentTunnelProfileId !== originTunnelProfileId
        if (!isChangeTunneling) {
          return Promise.resolve()
        }

        if (originTunnelProfileId !== undefined && originTunnelProfileId !== null) {
          mockedDeactivateNetwork({
            customHeaders: {
              'Content-Type': 'application/vnd.ruckus.v1.1+json'
            },
            params: {
              serviceId,
              venueId: venueId,
              wifiNetworkId: networkId
            },
            callback: cb
          })
        }

        if (currentTunnelProfileId !== undefined && currentTunnelProfileId !== null) {
          mockedActivateNetwork({
            customHeaders: {
              'Content-Type': 'application/vnd.ruckus.v1.1+json'
            },
            params: {
              serviceId,
              venueId: venueId,
              wifiNetworkId: networkId
            },
            payload: {
              ...(currentTunnelProfileId
                ? { forwardingTunnelProfileId: currentTunnelProfileId }
                : {})
            },
            callback: cb
          })
        }
        return Promise.resolve()
      },
      useDeactivateNetworkMutation: () => [mockedDeactivateNetwork],
      useActivateNetworkMutation: () => [mockedActivateNetwork]
    })
  }
})

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('useUpdateNetworkTunnelAction', () => {
  describe('L2oGRE is OFF', () => {
    beforeEach(() => {
      mockedToggleNetworkFn.mockClear()
      mockedToggleNetworkFn.mockImplementation((
        _id,
        _networkVenueId,
        _networkId,
        _sdLanTunneled,
        _isGuestTunnelEnabled,
        callback) => {
        (callback as Function)()
        return Promise.resolve()
      })
    })

    it('should correctly activate SDLAN tunneling', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const mockSdLan = mockedMvSdLanDataList[0]

      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.SdLan,
        sdLan: {
          isGuestTunnelEnabled: false
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: 'mock_psk_network_id',
        type: NetworkTypeEnum.PSK,
        venueId: mockSdLan.tunneledWlans![0].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.None, mockSdLan)
      expect(mockedToggleNetworkFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        true,
        false,
        expect.any(Function)
      )
    })

    it('should correctly turn off guest forwarding', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })
      const mockSdLan = mockedMvSdLanDataList[0]

      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.SdLan,
        sdLan: {
          isGuestTunnelEnabled: false
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: mockSdLan.tunneledWlans![1].networkId,
        type: NetworkTypeEnum.CAPTIVEPORTAL,
        venueId: mockSdLan.tunneledWlans![1].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.SdLan, mockSdLan)
      expect(mockedToggleNetworkFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        true,
        false,
        expect.any(Function)
      )
    })

    it('should correctly deactivate SDLAN tunneling', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })
      const mockSdLan = mockedMvSdLanDataList[0]

      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.None,
        sdLan: {
          isGuestTunnelEnabled: false
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: mockSdLan.tunneledWlans![0].networkId,
        type: NetworkTypeEnum.PSK,
        venueId: mockSdLan.tunneledWlans![0].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.SdLan, mockSdLan)
      expect(mockedToggleNetworkFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        false,
        false,
        expect.any(Function)
      )
      expect(mockedToggleNetworkFn).toBeCalledTimes(1)
    })

    // eslint-disable-next-line max-len
    it('should reject when trying to operate target network venueId is not SDLAN scoped', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })
      const mockSdLan = mockedMvSdLanDataList[0]

      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.SdLan,
        sdLan: {
          isGuestTunnelEnabled: false
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: mockSdLan.tunneledWlans![0].networkId,
        type: NetworkTypeEnum.DPSK,
        venueId: 'mock_new_venue_id'
      }

      let isFailed: boolean
      try {
        await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.SdLan, mockSdLan)
        isFailed = false
      } catch(err) {
        isFailed = true
      }

      expect(isFailed).toBe(true)
    })
  })

  describe('L2oGRE is ON', () => {
    beforeEach(() => {
      mockedToggleNetworkChangeFn.mockClear()
      mockedToggleNetworkChangeFn.mockImplementation((
        _id,
        _networkVenueId,
        _networkId,
        _currentFwdTunnelProfileId,
        _originFwdTunnelId,
        callback) => {
        (callback as Function)()
        return Promise.resolve()
      })
      mockedDeactivateNetwork.mockClear()
      mockedActivateNetwork.mockClear()

      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff =>(ff === Features.EDGE_L2OGRE_TOGGLE))
    })

    it('should correctly activate SDLAN tunneling', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })

      const mockSdLan = mockedMvSdLanDataList[0]

      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.SdLan,
        sdLan: {
          forwardingTunnelProfileId: '',
          forwardingTunnelType: ''
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: 'mock_psk_network_id',
        type: NetworkTypeEnum.PSK,
        venueId: mockSdLan.tunneledWlans![0].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.None, mockSdLan)
      expect(mockedToggleNetworkChangeFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        '',
        undefined,
        expect.any(Function)
      )
      expect(mockedDeactivateNetwork).toBeCalledTimes(0)
      expect(mockedActivateNetwork).toBeCalledTimes(1)
    })

    it('should correctly deactivate and activate SDLAN tunneling', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })
      const mockSdLan = mockedMvSdLanDataList[0]
      const mockForwardingTunnelProfileId = 'mock_fw_tunnel_id_1'
      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.None,
        sdLan: {
          forwardingTunnelProfileId: mockForwardingTunnelProfileId,
          forwardingTunnelType: TunnelTypeEnum.VXLAN_GPE
        }
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: mockSdLan.tunneledWlans![0].networkId,
        type: NetworkTypeEnum.PSK,
        venueId: mockSdLan.tunneledWlans![0].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.SdLan, mockSdLan)
      expect(mockedToggleNetworkChangeFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        mockForwardingTunnelProfileId,
        mockSdLan.tunneledWlans![0].forwardingTunnelProfileId,
        expect.any(Function)
      )
      expect(mockedDeactivateNetwork).toBeCalledTimes(1)
      expect(mockedActivateNetwork).toBeCalledTimes(1)
    })

    it('should correctly deactivate SDLAN tunneling', async () => {
      const { result } = renderHook(() => useUpdateNetworkTunnelAction(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
      })
      const mockSdLan = mockedMvSdLanDataList[0]
      const mockFormValues = {
        tunnelType: NetworkTunnelTypeEnum.None,
        sdLan: {}
      } as NetworkTunnelActionForm

      const mockNetwork = {
        id: mockSdLan.tunneledWlans![0].networkId,
        type: NetworkTypeEnum.PSK,
        venueId: mockSdLan.tunneledWlans![0].venueId
      }

      await result.current(mockFormValues, mockNetwork, NetworkTunnelTypeEnum.SdLan, mockSdLan)
      expect(mockedToggleNetworkChangeFn).toBeCalledWith(
        mockSdLan.id,
        mockNetwork.venueId,
        mockNetwork.id,
        undefined,
        mockSdLan.tunneledWlans![0].forwardingTunnelProfileId,
        expect.any(Function)
      )
      expect(mockedDeactivateNetwork).toBeCalledTimes(1)
      expect(mockedActivateNetwork).toBeCalledTimes(0)
    })
  })
})



describe('mergeSdLanCacheAct', () => {

  it('should correctly merge', async () => {
    const mockDmzSdLan = mockedMvSdLanDataList[0]
    const mockDcSdLan = mockedMvSdLanDataList[1]

    const targetNetwork = mockDmzSdLan.tunneledWlans![1]
    const targetNetwork2 = mockDcSdLan.tunneledWlans![1]

    const acts = [
      // disable fwd guest traffic
      {
        serviceId: mockDmzSdLan.id,
        venueId: targetNetwork.venueId,
        networkId: targetNetwork.networkId,
        guestEnabled: false,
        enabled: true
      },
      // deactivate network
      {
        serviceId: mockDmzSdLan.id,
        venueId: mockDmzSdLan.tunneledWlans![0].venueId,
        networkId: mockDmzSdLan.tunneledWlans![0].networkId,
        guestEnabled: false,
        enabled: false
      },
      // other SDLAN
      {
        serviceId: mockDcSdLan.id,
        venueId: targetNetwork2.venueId,
        networkId: targetNetwork2.networkId,
        guestEnabled: false,
        enabled: false
      }
    ] as NetworkTunnelSdLanAction[]

    const result = mergeSdLanCacheAct(mockDmzSdLan, acts)
    expect(result.tunneledWlans?.length).toBe(mockDmzSdLan.tunneledWlans!.length - 1)
    expect(result.tunneledGuestWlans?.length).toBe(mockDmzSdLan.tunneledGuestWlans!.length - 1)
  })

  it('should correctly merge case2', async () => {
    const mockDmzSdLan = mockedMvSdLanDataList[0]

    const targetNetwork = mockDmzSdLan.tunneledWlans![0]

    const acts = [
      // enable fwd guest traffic
      {
        serviceId: mockDmzSdLan.id,
        venueId: targetNetwork.venueId,
        networkId: targetNetwork.networkId,
        guestEnabled: true,
        enabled: true
      },
      // activate network
      {
        serviceId: mockDmzSdLan.id,
        venueId: targetNetwork.venueId,
        networkId: 'mocked_new_network_id',
        guestEnabled: false,
        enabled: true
      }
    ] as NetworkTunnelSdLanAction[]

    const result = mergeSdLanCacheAct(mockDmzSdLan, acts)
    expect(result.tunneledWlans?.length).toBe(mockDmzSdLan.tunneledWlans!.length + 1)
    expect(result.tunneledGuestWlans?.length).toBe(mockDmzSdLan.tunneledGuestWlans!.length + 1)
  })
})