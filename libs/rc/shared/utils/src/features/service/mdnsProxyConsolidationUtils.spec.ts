import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'

import { ServiceType }           from '../../constants'
import { useIsEdgeFeatureReady } from '../edge'

import { useMdnsProxyStateMap } from './mdnsProxyConsolidationUtils'

jest.mock('../edge', () => ({
  ...jest.requireActual('../edge'),
  useIsEdgeFeatureReady: jest.fn()
}))

describe('mdnsProxyConsolidationUtils', () => {
  describe('useMdnsProxyStateMap', () => {

    afterEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)
    })

    it('should return correct disabled map if both feature flags are enabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MDNS_PROXY_CONSOLIDATION)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

      const { result } = renderHook(() => useMdnsProxyStateMap())

      expect(result.current).toEqual({
        [ServiceType.MDNS_PROXY]: true,
        [ServiceType.EDGE_MDNS_PROXY]: true,
        [ServiceType.MDNS_PROXY_CONSOLIDATION]: false
      })
    })

    it('should return correct disabled map if MDNS_PROXY_CONSOLIDATION is disabled', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

      const { result } = renderHook(() => useMdnsProxyStateMap())

      expect(result.current).toEqual({
        [ServiceType.MDNS_PROXY]: false,
        [ServiceType.EDGE_MDNS_PROXY]: false,
        [ServiceType.MDNS_PROXY_CONSOLIDATION]: true
      })
    })

    it('should return correct disabled map if EDGE_MDNS_PROXY_TOGGLE is disabled', () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MDNS_PROXY_CONSOLIDATION)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

      const { result } = renderHook(() => useMdnsProxyStateMap())

      expect(result.current).toEqual({
        [ServiceType.MDNS_PROXY]: false,
        [ServiceType.EDGE_MDNS_PROXY]: true,
        [ServiceType.MDNS_PROXY_CONSOLIDATION]: true
      })
    })

    it('should return correct disabled map if both feature flags are disabled', () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(useIsEdgeFeatureReady).mockReturnValue(false)

      const { result } = renderHook(() => useMdnsProxyStateMap())

      expect(result.current).toEqual({
        [ServiceType.MDNS_PROXY]: false,
        [ServiceType.EDGE_MDNS_PROXY]: true,
        [ServiceType.MDNS_PROXY_CONSOLIDATION]: true
      })
    })
  })

})
