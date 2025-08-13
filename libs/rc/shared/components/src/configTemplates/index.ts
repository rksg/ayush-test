import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType, useIsEdgeFeatureReady }              from '@acx-ui/rc/utils'
import { isRecSite }                                              from '@acx-ui/utils'
export * from './ConfigTemplateLink'
export * from './utils'
export * from './EnforceTemplateToggle'

export function useIsConfigTemplateTierAllowed (): boolean {
  return useIsTierAllowed(TierFeatures.CONFIG_TEMPLATE)
}

export function useConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const mspVisibilityMap = useMspConfigTemplateVisibilityMap()
  const recVisibilityMap = useRecConfigTemplateVisibilityMap()

  return isRecSite() ? recVisibilityMap : mspVisibilityMap
}

function useMspConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const isTierAllowed = useIsConfigTemplateTierAllowed()
  const isEthernetPortTemplateEnabled = useIsSplitOn(Features.ETHERNET_PORT_TEMPLATE_TOGGLE)
  const isIdentityGroupTemplateEnabled = useIsSplitOn(Features.IDENTITY_GROUP_CONFIG_TEMPLATE)
  // eslint-disable-next-line max-len
  const isTunnelProfileTemplateEnabled = useIsEdgeFeatureReady(Features.EDGE_WIFI_TUNNEL_TEMPLATE_TOGGLE)

  const visibilityMap: Record<ConfigTemplateType, boolean> = {
    [ConfigTemplateType.NETWORK]: isTierAllowed,
    [ConfigTemplateType.VENUE]: isTierAllowed,
    [ConfigTemplateType.DPSK]: isTierAllowed,
    [ConfigTemplateType.RADIUS]: isTierAllowed,
    [ConfigTemplateType.DHCP]: isTierAllowed,
    [ConfigTemplateType.ACCESS_CONTROL]: isTierAllowed,
    [ConfigTemplateType.LAYER_2_POLICY]: isTierAllowed,
    [ConfigTemplateType.LAYER_3_POLICY]: isTierAllowed,
    [ConfigTemplateType.APPLICATION_POLICY]: isTierAllowed,
    [ConfigTemplateType.DEVICE_POLICY]: isTierAllowed,
    [ConfigTemplateType.PORTAL]: isTierAllowed,
    [ConfigTemplateType.VLAN_POOL]: isTierAllowed,
    [ConfigTemplateType.WIFI_CALLING]: isTierAllowed,
    [ConfigTemplateType.SYSLOG]: isTierAllowed,
    [ConfigTemplateType.CLIENT_ISOLATION]: false, // Not supported in the current scope
    [ConfigTemplateType.ROGUE_AP_DETECTION]: isTierAllowed,
    [ConfigTemplateType.SWITCH_REGULAR]: isTierAllowed,
    [ConfigTemplateType.SWITCH_CLI]: isTierAllowed,
    [ConfigTemplateType.AP_GROUP]: isTierAllowed,
    [ConfigTemplateType.ETHERNET_PORT_PROFILE]: isTierAllowed && isEthernetPortTemplateEnabled,
    [ConfigTemplateType.IDENTITY_GROUP]: isIdentityGroupTemplateEnabled,
    [ConfigTemplateType.TUNNEL_SERVICE]: isTunnelProfileTemplateEnabled
  }

  return visibilityMap
}

export function useIsConfigTemplateEnabledByType (type: ConfigTemplateType): boolean {
  const visibilityMap = useConfigTemplateVisibilityMap()
  return visibilityMap[type]
}

function useRecConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const isRecConfigTemplateP1Enabled = useIsSplitOn(Features.CONFIG_TEMPLATE_REC_P1)

  const visibilityMap: Record<ConfigTemplateType, boolean> = {
    [ConfigTemplateType.NETWORK]: isRecConfigTemplateP1Enabled,
    [ConfigTemplateType.VENUE]: isRecConfigTemplateP1Enabled,
    [ConfigTemplateType.DPSK]: isRecConfigTemplateP1Enabled,
    [ConfigTemplateType.AP_GROUP]: false,
    [ConfigTemplateType.PORTAL]: false,
    [ConfigTemplateType.RADIUS]: false,
    [ConfigTemplateType.DHCP]: false,
    [ConfigTemplateType.ACCESS_CONTROL]: false,
    [ConfigTemplateType.LAYER_2_POLICY]: false,
    [ConfigTemplateType.LAYER_3_POLICY]: false,
    [ConfigTemplateType.APPLICATION_POLICY]: false,
    [ConfigTemplateType.DEVICE_POLICY]: false,
    [ConfigTemplateType.VLAN_POOL]: false,
    [ConfigTemplateType.WIFI_CALLING]: false,
    [ConfigTemplateType.SYSLOG]: false,
    [ConfigTemplateType.CLIENT_ISOLATION]: false,
    [ConfigTemplateType.ROGUE_AP_DETECTION]: false,
    [ConfigTemplateType.SWITCH_REGULAR]: false,
    [ConfigTemplateType.SWITCH_CLI]: false,
    [ConfigTemplateType.ETHERNET_PORT_PROFILE]: false,
    [ConfigTemplateType.IDENTITY_GROUP]: false,
    [ConfigTemplateType.TUNNEL_SERVICE]: false
  }

  return visibilityMap
}
