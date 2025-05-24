import { Features, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { renderHook }                                                 from '@acx-ui/test-utils'

import { PolicyType } from '../../types'

import { useAvailableUnifiedServicesList }  from './useAvailableUnifiedServicesList'
import { BuildUnifiedServicesIncomingType } from './utils'

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(() => false),
  useIsBetaEnabled: jest.fn(() => false),
  useIsTierAllowed: jest.fn(() => false)
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  isCoreTier: jest.fn().mockReturnValue(false)
}))

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  buildUnifiedServices: (list: BuildUnifiedServicesIncomingType[]) => {
    return list.map((s: BuildUnifiedServicesIncomingType) => ({
      ...s,
      label: s.type,
      description: s.type + ' description'
    }))
  },
  isUnifiedServiceAvailable: () => true
}))

describe('useAvailableUnifiedServicesList', () => {
  it('should return a non-empty list of services and policies', () => {
    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('should disable services correctly based on feature flags', () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    // eslint-disable-next-line max-len
    const aclConsolidation = result.current.find(s => s.type === PolicyType.ACCESS_CONTROL_CONSOLIDATION)
    expect(aclConsolidation?.disabled).toBe(false)
  })

  it('should mark beta services correctly', () => {
    jest.mocked(useIsBetaEnabled).mockReturnValue(true)

    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    const hqos = result.current.find(s => s.type === PolicyType.HQOS_BANDWIDTH)
    expect(hqos?.isBetaFeature).toBe(true)
  })

  it('should return disabled when feature is not allowed', () => {
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff !== Features.CLOUDPATH_BETA)

    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    const adaptivePolicy = result.current.find(s => s.type === PolicyType.ADAPTIVE_POLICY)
    expect(adaptivePolicy?.disabled).toBe(true)
  })

  it('should disable services correctly based on account tier', () => {
    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    const aclConsolidation = result.current.find(s => s.type === PolicyType.WORKFLOW)
    expect(aclConsolidation?.disabled).toBe(true)
  })
})
