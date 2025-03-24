import { EdgeSdLanFixtures, NetworkTunnelSdLanAction, NetworkTypeEnum } from '@acx-ui/rc/utils'
import { renderHook }                                                   from '@acx-ui/test-utils'

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
describe('useUpdateNetworkTunnelAction', () => {
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
    const { result } = renderHook(() => useUpdateNetworkTunnelAction())
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
    const { result } = renderHook(() => useUpdateNetworkTunnelAction())
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
    const { result } = renderHook(() => useUpdateNetworkTunnelAction())
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
    const { result } = renderHook(() => useUpdateNetworkTunnelAction())
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