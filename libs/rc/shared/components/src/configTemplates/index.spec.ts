import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }                       from '@acx-ui/rc/utils'
import { renderHook }                               from '@acx-ui/test-utils'

import { useConfigTemplateVisibilityMap, useServicePolicyEnabledWithConfigTemplate } from '.'

const mockedIsRecSite = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  isRecSite: () => mockedIsRecSite()
}))

const mockedUseConfigTemplate = jest.fn()
const mockedUseIsEdgeFeatureReady = jest.fn()
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: () => mockedUseIsEdgeFeatureReady(),
  useConfigTemplate: () => mockedUseConfigTemplate()
}))

describe('useIsConfigTemplateOnByType', () => {
  beforeEach(() => {
    mockedIsRecSite.mockReturnValue(false)
    mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })
    mockedUseIsEdgeFeatureReady.mockReturnValue(false)
  })

  it('should return the correct map when the tier allowed is OFF', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: false,
      [ConfigTemplateType.VENUE]: false,
      [ConfigTemplateType.DPSK]: false,
      [ConfigTemplateType.RADIUS]: false,
      [ConfigTemplateType.DHCP]: false,
      [ConfigTemplateType.ACCESS_CONTROL]: false,
      [ConfigTemplateType.LAYER_2_POLICY]: false,
      [ConfigTemplateType.LAYER_3_POLICY]: false,
      [ConfigTemplateType.APPLICATION_POLICY]: false,
      [ConfigTemplateType.DEVICE_POLICY]: false,
      [ConfigTemplateType.PORTAL]: false,
      [ConfigTemplateType.VLAN_POOL]: false,
      [ConfigTemplateType.WIFI_CALLING]: false,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
      [ConfigTemplateType.SYSLOG]: false,
      [ConfigTemplateType.SWITCH_REGULAR]: false,
      [ConfigTemplateType.SWITCH_CLI]: false,
      [ConfigTemplateType.AP_GROUP]: false,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false,
      [ConfigTemplateType.IDENTITY_GROUP]: false,
      [ConfigTemplateType.TUNNEL_SERVICE]: false
    })
  })

  // eslint-disable-next-line max-len
  it('should return the correct map when the tier allowed is ON', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: true,
      [ConfigTemplateType.DPSK]: true,
      [ConfigTemplateType.RADIUS]: true,
      [ConfigTemplateType.DHCP]: true,
      [ConfigTemplateType.ACCESS_CONTROL]: true,
      [ConfigTemplateType.LAYER_2_POLICY]: true,
      [ConfigTemplateType.LAYER_3_POLICY]: true,
      [ConfigTemplateType.APPLICATION_POLICY]: true,
      [ConfigTemplateType.DEVICE_POLICY]: true,
      [ConfigTemplateType.PORTAL]: true,
      [ConfigTemplateType.VLAN_POOL]: true,
      [ConfigTemplateType.WIFI_CALLING]: true,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: true,
      [ConfigTemplateType.SYSLOG]: true,
      [ConfigTemplateType.SWITCH_REGULAR]: true,
      [ConfigTemplateType.SWITCH_CLI]: true,
      [ConfigTemplateType.AP_GROUP]: true,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false,
      [ConfigTemplateType.IDENTITY_GROUP]: false,
      [ConfigTemplateType.TUNNEL_SERVICE]: false
    })
  })

  it('should return the correct map for the other scope', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => (
      ff === Features.ETHERNET_PORT_TEMPLATE_TOGGLE ||
      ff === Features.IDENTITY_GROUP_CONFIG_TEMPLATE
    ))
    mockedUseIsEdgeFeatureReady.mockReturnValue(true)

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: true,
      [ConfigTemplateType.DPSK]: true,
      [ConfigTemplateType.RADIUS]: true,
      [ConfigTemplateType.DHCP]: true,
      [ConfigTemplateType.ACCESS_CONTROL]: true,
      [ConfigTemplateType.LAYER_2_POLICY]: true,
      [ConfigTemplateType.LAYER_3_POLICY]: true,
      [ConfigTemplateType.APPLICATION_POLICY]: true,
      [ConfigTemplateType.DEVICE_POLICY]: true,
      [ConfigTemplateType.PORTAL]: true,
      [ConfigTemplateType.VLAN_POOL]: true,
      [ConfigTemplateType.WIFI_CALLING]: true,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: true,
      [ConfigTemplateType.SYSLOG]: true,
      [ConfigTemplateType.SWITCH_REGULAR]: true,
      [ConfigTemplateType.SWITCH_CLI]: true,
      [ConfigTemplateType.AP_GROUP]: true,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: true,
      [ConfigTemplateType.IDENTITY_GROUP]: true,
      [ConfigTemplateType.TUNNEL_SERVICE]: true
    })
  })

  it('should return the correct map for the rec site', () => {
    mockedIsRecSite.mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => (ff === Features.CONFIG_TEMPLATE_REC_P1))

    const { result } = renderHook(() => useConfigTemplateVisibilityMap())

    expect(result.current).toEqual({
      [ConfigTemplateType.NETWORK]: true,
      [ConfigTemplateType.VENUE]: true,
      [ConfigTemplateType.DPSK]: true,
      [ConfigTemplateType.PORTAL]: true,
      [ConfigTemplateType.RADIUS]: true,
      [ConfigTemplateType.AP_GROUP]: false,
      [ConfigTemplateType.DHCP]: false,
      [ConfigTemplateType.ACCESS_CONTROL]: false,
      [ConfigTemplateType.LAYER_2_POLICY]: false,
      [ConfigTemplateType.LAYER_3_POLICY]: false,
      [ConfigTemplateType.APPLICATION_POLICY]: false,
      [ConfigTemplateType.DEVICE_POLICY]: false,
      [ConfigTemplateType.VLAN_POOL]: false,
      [ConfigTemplateType.WIFI_CALLING]: false,
      [ConfigTemplateType.SYSLOG]: false,
      [ConfigTemplateType.TUNNEL_SERVICE]: false,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
      [ConfigTemplateType.SWITCH_REGULAR]: false,
      [ConfigTemplateType.SWITCH_CLI]: false,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false,
      [ConfigTemplateType.IDENTITY_GROUP]: false
    })
  })

  describe('useServicePolicyEnabledWithConfigTemplate', () => {
    beforeEach(() => {
      jest.restoreAllMocks()
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })

    it('should return false if neither policy nor service config template', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.VENUE))

      expect(result.current).toBe(false)
    })

    it('should return true if policy config template and policy enabled', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.ACCESS_CONTROL))

      expect(result.current).toBe(true)
    })

    it('should return true if service config template and service enabled', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })

    it('should return true if it is not a config template', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: false })

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.PORTAL))

      expect(result.current).toBe(true)
    })

    it('should return false if it is a config template and policy is disabled', () => {
      mockedUseConfigTemplate.mockReturnValue({ isTemplate: true })
      jest.mocked(useIsTierAllowed).mockReturnValue(false)

      // eslint-disable-next-line max-len
      const { result } = renderHook(() => useServicePolicyEnabledWithConfigTemplate(ConfigTemplateType.ACCESS_CONTROL))

      expect(result.current).toBe(false)
    })
  })
})
