import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'

import { ServiceType }           from '../../constants'
import { useIsEdgeFeatureReady } from '../edge'

import { useDhcpStateMap } from './dhcpConsolidationUtils'

jest.mock('../edge', () => ({
  ...jest.requireActual('../edge'),
  useIsEdgeFeatureReady: jest.fn()
}))

describe('dhcpConsolidationUtils', () => {
  describe('useDhcpStateMap', () => {

    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    })

    it('should return correct stateMap if both feature flags are enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DHCP_CONSOLIDATION)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

      const { result } = renderHook(() => useDhcpStateMap())

      expect(result.current).toEqual({
        [ServiceType.DHCP]: false,
        [ServiceType.EDGE_DHCP]: false,
        [ServiceType.DHCP_CONSOLIDATION]: true
      })
    })

    it('should return correct stateMap if DHCP_CONSOLIDATION is disabled', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

      const { result } = renderHook(() => useDhcpStateMap())

      expect(result.current).toEqual({
        [ServiceType.DHCP]: true,
        [ServiceType.EDGE_DHCP]: true,
        [ServiceType.DHCP_CONSOLIDATION]: false
      })
    })

    it('should return correct stateMap if EDGE_DHCP is disabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.DHCP_CONSOLIDATION)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

      const { result } = renderHook(() => useDhcpStateMap())

      expect(result.current).toEqual({
        [ServiceType.DHCP]: true,
        [ServiceType.EDGE_DHCP]: false,
        [ServiceType.DHCP_CONSOLIDATION]: false
      })
    })

    it('should return correct stateMap if both feature flags are disabled', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

      const { result } = renderHook(() => useDhcpStateMap())

      expect(result.current).toEqual({
        [ServiceType.DHCP]: true,
        [ServiceType.EDGE_DHCP]: false,
        [ServiceType.DHCP_CONSOLIDATION]: false
      })
    })
  })

})
