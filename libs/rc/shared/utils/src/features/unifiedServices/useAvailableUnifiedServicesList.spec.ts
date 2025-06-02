import { Features, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { renderHook }                                                 from '@acx-ui/test-utils'
import { isCoreTier }                                                 from '@acx-ui/user'

import { ServiceType } from '../../constants'
import { PolicyType }  from '../../types'

import { useAvailableUnifiedServicesList }  from './useAvailableUnifiedServicesList'
import { BuildUnifiedServicesIncomingType } from './utils'

const mockedUseMdnsProxyStateMap = jest.fn().mockReturnValue({
  [ServiceType.MDNS_PROXY]: true,
  [ServiceType.EDGE_MDNS_PROXY]: false,
  [ServiceType.MDNS_PROXY_CONSOLIDATION]: false
})
jest.mock('../service', () => ({
  ...jest.requireActual('../service'),
  useMdnsProxyStateMap: () => mockedUseMdnsProxyStateMap()
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(() => false),
  useIsBetaEnabled: jest.fn(() => false),
  useIsTierAllowed: jest.fn(() => false)
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  isCoreTier: jest.fn(() => false)
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
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    jest.mocked(useIsBetaEnabled).mockReturnValue(false)
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.mocked(isCoreTier).mockReturnValue(false)
    mockedUseMdnsProxyStateMap.mockReturnValue({
      [ServiceType.MDNS_PROXY]: true,
      [ServiceType.EDGE_MDNS_PROXY]: false,
      [ServiceType.MDNS_PROXY_CONSOLIDATION]: false
    })
  })

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
    const workflowService = result.current.find(s => s.type === PolicyType.WORKFLOW)
    expect(workflowService?.disabled).toBe(true)
  })

  it('should disable mDNS Proxy Consolidation service', () => {
    mockedUseMdnsProxyStateMap.mockReturnValue({
      [ServiceType.MDNS_PROXY]: true,
      [ServiceType.EDGE_MDNS_PROXY]: true,
      [ServiceType.MDNS_PROXY_CONSOLIDATION]: false
    })

    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    // eslint-disable-next-line max-len
    const mDNSProxyConsolidation = result.current.find(s => s.type === ServiceType.MDNS_PROXY_CONSOLIDATION)
    const mDNSProxy = result.current.find(s => s.type === ServiceType.MDNS_PROXY)
    const edgeMDNSProxy = result.current.find(s => s.type === ServiceType.EDGE_MDNS_PROXY)
    expect(mDNSProxyConsolidation?.disabled).toBe(true)
    expect(mDNSProxy?.disabled).toBe(false)
    expect(edgeMDNSProxy?.disabled).toBe(false)
  })

  it('should enable mDNS Proxy Consolidation service', () => {
    mockedUseMdnsProxyStateMap.mockReturnValue({
      [ServiceType.MDNS_PROXY]: false,
      [ServiceType.EDGE_MDNS_PROXY]: false,
      [ServiceType.MDNS_PROXY_CONSOLIDATION]: true
    })

    const { result } = renderHook(() => useAvailableUnifiedServicesList())
    // eslint-disable-next-line max-len
    const mDNSProxyConsolidation = result.current.find(s => s.type === ServiceType.MDNS_PROXY_CONSOLIDATION)
    const mDNSProxy = result.current.find(s => s.type === ServiceType.MDNS_PROXY)
    const edgeMDNSProxy = result.current.find(s => s.type === ServiceType.EDGE_MDNS_PROXY)
    expect(mDNSProxyConsolidation?.disabled).toBe(false)
    expect(mDNSProxy?.disabled).toBe(true)
    expect(edgeMDNSProxy?.disabled).toBe(true)
  })
})
