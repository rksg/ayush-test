/* eslint-disable max-len */
import { Features, TierFeatures } from '@acx-ui/feature-toggle'
import { renderHook }             from '@acx-ui/test-utils'

import { useIsEdgeFeatureReady } from './useIsEdgeFeatureReady'

// Mock the feature-toggle hooks
const mockUseIsSplitOn = jest.fn()
const mockUseIsTierAllowed = jest.fn()

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: () => mockUseIsSplitOn(),
  useIsTierAllowed: (featureId: string) => mockUseIsTierAllowed(featureId)
}))

describe('useIsEdgeFeatureReady', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('EDGE_PIN_HA_TOGGLE and EDGE_PIN_ENHANCE_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeAdvEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ADV) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_ADV)
    })

    it('should return false when isEdgeFeatureReady is false', () => {
      mockUseIsSplitOn.mockReturnValue(false)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ADV) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
      expect(result.current).toBe(false)
    })

    it('should return false when isEdgeAdvEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ADV) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
      expect(result.current).toBe(false)
    })

    it('should work for EDGE_PIN_ENHANCE_TOGGLE as well', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ADV) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE))
      expect(result.current).toBe(true)
    })
  })

  describe('EDGE_AV_REPORT_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeAvReportEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_AV_REPORT) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_AV_REPORT)
    })

    it('should return false when isEdgeAvReportEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_AV_REPORT) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeNatTEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_NAT_T) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_NAT_T)
    })

    it('should return false when isEdgeNatTEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_NAT_T) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_ARPT_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeArpTerminationEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ARPT) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_ARPT)
    })

    it('should return false when isEdgeArpTerminationEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_ARPT) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_MDNS_PROXY_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeMdnsProxyEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_MDNS_PROXY) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_MDNS_PROXY)
    })

    it('should return false when isEdgeMdnsProxyEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_MDNS_PROXY) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_QOS_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeHqosEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_HQOS) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_HQOS)
    })

    it('should return false when isEdgeHqosEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_HQOS) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_L2OGRE_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeL2oGREEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_L2OGRE) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_L2OGRE)
    })

    it('should return false when isEdgeL2oGREEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_L2OGRE) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_MULTI_NAT_IP_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeMultiNatIpEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_NAT_IP_POOL) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_NAT_IP_POOL)
    })

    it('should return false when isEdgeMultiNatIpEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_NAT_IP_POOL) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_DUAL_WAN_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeMultiWanEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_DUAL_WAN) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_DUAL_WAN)
    })

    it('should return false when isEdgeMultiWanEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_DUAL_WAN) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_WIFI_TUNNEL_TEMPLATE_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeTunnelTemplateEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_TUNNEL_TEMPLATE) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_WIFI_TUNNEL_TEMPLATE_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_TUNNEL_TEMPLATE)
    })

    it('should return false when isEdgeTunnelTemplateEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_TUNNEL_TEMPLATE) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_WIFI_TUNNEL_TEMPLATE_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('EDGE_DELEGATION_TOGGLE', () => {
    it('should return true when both isEdgeFeatureReady and isEdgeDelegationEnabled are true', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_DELEGATION) return true
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE))
      expect(result.current).toBe(true)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_DELEGATION)
    })

    it('should return false when isEdgeDelegationEnabled is false', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        if (featureId === TierFeatures.EDGE_DELEGATION) return false
        return false
      })

      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_DELEGATION_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('default case', () => {
    it('should return isEdgeFeatureReady for unknown feature flags', () => {
      mockUseIsSplitOn.mockReturnValue(false)
      mockUseIsTierAllowed.mockImplementation(() => false)

      const { result } = renderHook(() => useIsEdgeFeatureReady('UNKNOWN_FEATURE' as Features))
      expect(result.current).toBe(false)
    })

    it('should return false when isEdgeFeatureReady is false for unknown feature flags', () => {
      mockUseIsSplitOn.mockReturnValue(false)
      mockUseIsTierAllowed.mockImplementation(() => true)

      const { result } = renderHook(() => useIsEdgeFeatureReady('UNKNOWN_FEATURE' as Features))
      expect(result.current).toBe(false)
    })
  })

  describe('all tier features are called correctly', () => {
    it('should call all tier features when checking a feature that requires EDGE_ADV', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation(() => true)

      renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))

      // Verify all tier features are called
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_ADV)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_AV_REPORT)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_NAT_T)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_ARPT)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_MDNS_PROXY)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_HQOS)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_L2OGRE)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_NAT_IP_POOL)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_DUAL_WAN)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_TUNNEL_TEMPLATE)
      expect(mockUseIsTierAllowed).toHaveBeenCalledWith(TierFeatures.EDGE_DELEGATION)
    })
  })

  describe('edge cases', () => {
    it('should handle multiple feature checks in sequence', () => {
      mockUseIsSplitOn.mockReturnValue(true)
      mockUseIsTierAllowed.mockImplementation((featureId: string) => {
        const tierMap: Record<string, boolean> = {
          [TierFeatures.EDGE_ADV]: true,
          [TierFeatures.EDGE_AV_REPORT]: false,
          [TierFeatures.EDGE_NAT_T]: true,
          [TierFeatures.EDGE_ARPT]: false,
          [TierFeatures.EDGE_MDNS_PROXY]: true,
          [TierFeatures.EDGE_HQOS]: false,
          [TierFeatures.EDGE_L2OGRE]: true,
          [TierFeatures.EDGE_NAT_IP_POOL]: false,
          [TierFeatures.EDGE_DUAL_WAN]: true,
          [TierFeatures.EDGE_TUNNEL_TEMPLATE]: false,
          [TierFeatures.EDGE_DELEGATION]: true
        }
        return tierMap[featureId] || false
      })

      const { result: result1 } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
      const { result: result2 } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE))
      const { result: result3 } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))

      expect(result1.current).toBe(true)  // EDGE_ADV is true
      expect(result2.current).toBe(false) // EDGE_AV_REPORT is false
      expect(result3.current).toBe(true)  // EDGE_NAT_T is true
    })
  })
})