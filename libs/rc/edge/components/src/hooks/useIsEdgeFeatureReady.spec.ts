import { renderHook } from '@testing-library/react'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'

import { useIsEdgeFeatureReady } from './useIsEdgeFeatureReady'

// Mock the feature toggle hooks
jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn()
}))

describe('useIsEdgeFeatureReady', () => {
  const mockUseIsSplitOn = jest.fn()
  const mockUseIsTierAllowed = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Default to edge enabled and feature flag on
    mockUseIsSplitOn.mockReturnValue(true)
    mockUseIsTierAllowed.mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(mockUseIsSplitOn)
    jest.mocked(useIsTierAllowed).mockImplementation(mockUseIsTierAllowed)
  })

  it('should return true when edge is enabled and feature flag is on', () => {
    const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
    expect(result.current).toBe(true)
  })

  it('should return false when edge is disabled', () => {
    mockUseIsSplitOn.mockImplementation((flag) => flag === Features.EDGES_TOGGLE ? false : true)
    const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
    expect(result.current).toBe(false)
  })

  it('should return false when feature flag is disabled', () => {
    mockUseIsSplitOn.mockImplementation((flag) => flag === !Features.EDGE_PIN_HA_TOGGLE)
    const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
    expect(result.current).toBe(false)
  })

  describe('Advanced Edge Features', () => {
    it('should require EDGE_ADV tier for EDGE_PIN_HA_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_ADV)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE))
      expect(result.current).toBe(false)
    })

    it('should require EDGE_ADV tier for EDGE_PIN_ENHANCE_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_ADV)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('AV Report Feature', () => {
    it('should require EDGE_AV_REPORT tier for EDGE_AV_REPORT_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_AV_REPORT)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('NAT Traversal Feature', () => {
    it('should require EDGE_NAT_T tier for EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_NAT_T)
      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_NAT_TRAVERSAL_PHASE1_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('ARP Termination Feature', () => {
    it('should require EDGE_ARPT tier for EDGE_ARPT_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_ARPT)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('mDNS Proxy Feature', () => {
    it('should require EDGE_MDNS_PROXY tier for EDGE_MDNS_PROXY_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_MDNS_PROXY)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('QoS Feature', () => {
    it('should require EDGE_HQOS tier for EDGE_QOS_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_HQOS)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('L2oGRE Feature', () => {
    it('should require EDGE_L2OGRE tier for EDGE_L2OGRE_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_L2OGRE)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE))
      expect(result.current).toBe(false)
    })
  })

  describe('Multi-WAN Feature', () => {
    it('should require EDGE_MULTI_WAN tier for EDGE_DUAL_WAN_TOGGLE', () => {
      mockUseIsTierAllowed.mockImplementation((tier) => tier === !TierFeatures.EDGE_MULTI_WAN)
      const { result } = renderHook(() => useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE))
      expect(result.current).toBe(false)
    })
  })
})