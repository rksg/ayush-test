
import { Features } from '@acx-ui/feature-toggle'
import {
  EdgeSdLanTunneledWlan,
  NetworkTunnelSdLanAction,
  NetworkVenue
} from '@acx-ui/rc/utils'
import { Provider }   from '@acx-ui/store'
import { renderHook } from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

import {
  useUpdateEdgeSdLanActivations
} from './edgeUtils'


const mockedToggleNetworkChangeFn = jest.fn()
const mockedToggleNetworkFn = jest.fn()
jest.mock('../EdgeSdLan/useEdgeSdLanActions', () => ({
  ...jest.requireActual('../EdgeSdLan/useEdgeSdLanActions'),
  useEdgeMvSdLanActions: () => ({
    toggleNetwork: mockedToggleNetworkFn
  })
}))

jest.mock('@acx-ui/edge/components', () => ({
  ...jest.requireActual('@acx-ui/edge/components'),
  useEdgeSdLanActions: () => ({
    toggleNetworkChange: mockedToggleNetworkChangeFn
  })
}))

jest.mock('../useEdgeActions', () => ({
  ...jest.requireActual('../useEdgeActions'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('useUpdateEdgeSdLanActivations', () => {
  const networkId = 'network-id'

  const updates = [
    {
      serviceId: 'mockDmzSdLan_id_1',
      venueId: 'venue_1',
      networkId: 'targetNetwork_networkId_1',
      guestEnabled: true,
      enabled: true,
      forwardingTunnelProfileId: '',
      venueSdLanInfo: {
        tunneledWlans: [
          { venueId: 'venue_1',
            venueName: 'venuename1',
            networkId: networkId,
            forwardingTunnelProfileId: '' }
        ] as EdgeSdLanTunneledWlan[]
      }
    }
  ] as NetworkTunnelSdLanAction[]

  beforeEach(() => {
    mockedToggleNetworkFn.mockClear()
    mockedToggleNetworkFn.mockImplementation((
      _id,
      _networkVenueId,
      _networkId,
      _sdLanTunneled,
      _isGuestTunnelEnabled,
      callback) => {
      if (typeof callback === 'function') {
        callback()
      }
      return Promise.resolve()
    })
    mockedToggleNetworkChangeFn.mockClear()
    mockedToggleNetworkChangeFn.mockImplementation((
      _id,
      _networkVenueId,
      _networkId,
      _currentFwdTunnelProfileId,
      _originFwdTunnelId,
      callback) => {
      if (typeof callback === 'function') {
        callback()
      }
      return Promise.resolve()
    })
  })

  it('L2oGRE is FF', async () => {
    const activatedVenues = [{ venueId: 'venue_1' }, { venueId: 'venue_2' }] as NetworkVenue[]
    const { result } = renderHook(() => useUpdateEdgeSdLanActivations(),
      { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

    await result.current(networkId, updates, activatedVenues )
    expect(mockedToggleNetworkFn).toBeCalledWith(
      'mockDmzSdLan_id_1',
      'venue_1',
      networkId,
      true,
      true
    )

    expect(mockedToggleNetworkFn).toBeCalledTimes(1)
    expect(mockedToggleNetworkChangeFn).toBeCalledTimes(0)
  })

  it('L2oGRE is ON', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff =>(ff === Features.EDGE_L2OGRE_TOGGLE))

    const activatedVenues = [{ venueId: 'venue_1' }, { venueId: 'venue_2' }] as NetworkVenue[]
    const { result } = renderHook(() => useUpdateEdgeSdLanActivations(),
      { route: { params: { networkId: 'networkId' } }, wrapper: Provider })

    await result.current(networkId, updates, activatedVenues )
    expect(mockedToggleNetworkChangeFn).toBeCalledWith(
      'mockDmzSdLan_id_1',
      'venue_1',
      networkId,
      '',
      ''
    )

    expect(mockedToggleNetworkFn).toBeCalledTimes(0)
    expect(mockedToggleNetworkChangeFn).toBeCalledTimes(1)

  })
})
