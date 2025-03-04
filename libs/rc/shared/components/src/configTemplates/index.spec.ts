import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }                       from '@acx-ui/rc/utils'
import { renderHook }                               from '@acx-ui/test-utils'

import { useConfigTemplateVisibilityMap } from '.'

describe('useIsConfigTemplateOnByType', () => {
  it('should return the correct map when the BETA user is OFF', () => {
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
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false
    })
  })

  // eslint-disable-next-line max-len
  it('should return the correct map when the BETA user is ON and acx-ui-config-template is ON', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE)

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
      [ConfigTemplateType.SWITCH_REGULAR]: false,
      [ConfigTemplateType.SWITCH_CLI]: false,
      [ConfigTemplateType.AP_GROUP]: false,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false
    })
  })

  // eslint-disable-next-line max-len
  it('should return the correct map when the BETA user is ON and acx-ui-config-template is OFF', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(false)

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
      [ConfigTemplateType.VLAN_POOL]: false,
      [ConfigTemplateType.WIFI_CALLING]: false,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
      [ConfigTemplateType.SYSLOG]: false,
      [ConfigTemplateType.SWITCH_REGULAR]: false,
      [ConfigTemplateType.SWITCH_CLI]: false,
      [ConfigTemplateType.AP_GROUP]: false,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false
    })
  })

  it('should return the correct map for the extra scope', () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockImplementation(ff => (ff === Features.CONFIG_TEMPLATE_EXTRA ||
      ff === Features.ETHERNET_PORT_TEMPLATE_TOGGLE
    ))

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
      [ConfigTemplateType.VLAN_POOL]: false,
      [ConfigTemplateType.WIFI_CALLING]: false,
      [ConfigTemplateType.CLIENT_ISOLATION]: false,
      [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
      [ConfigTemplateType.SYSLOG]: false,
      [ConfigTemplateType.SWITCH_REGULAR]: true,
      [ConfigTemplateType.SWITCH_CLI]: true,
      [ConfigTemplateType.AP_GROUP]: true,
      [ConfigTemplateType.ETHERNET_PORT_PROFILE]: true
    })
  })
})
