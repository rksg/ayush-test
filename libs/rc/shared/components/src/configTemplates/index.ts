import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType, useIsEdgeFeatureReady }              from '@acx-ui/rc/utils'
import { isRecSite }                                              from '@acx-ui/utils'
export * from './ConfigTemplateLink'
export * from './utils'
export * from './EnforceTemplateToggle'

export function useIsConfigTemplateBeta (): boolean {
  return useIsTierAllowed(TierFeatures.CONFIG_TEMPLATE)
}

export function useIsConfigTemplateGA (): boolean {
  const isBeta = useIsConfigTemplateBeta()
  const isGA = useIsSplitOn(Features.CONFIG_TEMPLATE)
  return isBeta && isGA
}

export function useIsConfigTemplateExtra (): boolean {
  const isBeta = useIsConfigTemplateBeta()
  const isExtraScope = useIsSplitOn(Features.CONFIG_TEMPLATE_EXTRA)
  return isBeta && isExtraScope
}

export function useConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const mspVisibilityMap = useMspConfigTemplateVisibilityMap()
  const recVisibilityMap = useRecConfigTemplateVisibilityMap()

  return isRecSite() ? recVisibilityMap : mspVisibilityMap
}

function useMspConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const isBeta = useIsConfigTemplateBeta()
  const isGA = useIsConfigTemplateGA()
  const isExtraScope = useIsConfigTemplateExtra()
  const isEthernetPortTemplateEnabled = useIsSplitOn(Features.ETHERNET_PORT_TEMPLATE_TOGGLE)
  const isIdentityGroupTemplateEnabled = useIsSplitOn(Features.IDENTITY_GROUP_CONFIG_TEMPLATE)
  // eslint-disable-next-line max-len
  const isTunnelProfileTemplateEnabled = useIsEdgeFeatureReady(Features.EDGE_WIFI_TUNNEL_TEMPLATE_TOGGLE)

  const visibilityMap: Record<ConfigTemplateType, boolean> = {
    [ConfigTemplateType.NETWORK]: isBeta,
    [ConfigTemplateType.VENUE]: isBeta,
    [ConfigTemplateType.DPSK]: isBeta,
    [ConfigTemplateType.RADIUS]: isBeta,
    [ConfigTemplateType.DHCP]: isBeta,
    [ConfigTemplateType.ACCESS_CONTROL]: isBeta,
    [ConfigTemplateType.LAYER_2_POLICY]: isBeta,
    [ConfigTemplateType.LAYER_3_POLICY]: isBeta,
    [ConfigTemplateType.APPLICATION_POLICY]: isBeta,
    [ConfigTemplateType.DEVICE_POLICY]: isBeta,
    [ConfigTemplateType.PORTAL]: isBeta,
    [ConfigTemplateType.VLAN_POOL]: isGA,
    [ConfigTemplateType.WIFI_CALLING]: isGA,
    [ConfigTemplateType.SYSLOG]: isGA,
    [ConfigTemplateType.CLIENT_ISOLATION]: false, // Not supported in the current scope
    [ConfigTemplateType.ROGUE_AP_DETECTION]: isGA,
    [ConfigTemplateType.SWITCH_REGULAR]: isExtraScope,
    [ConfigTemplateType.SWITCH_CLI]: isExtraScope,
    [ConfigTemplateType.AP_GROUP]: isExtraScope,
    [ConfigTemplateType.ETHERNET_PORT_PROFILE]: isBeta && isEthernetPortTemplateEnabled,
    [ConfigTemplateType.IDENTITY_GROUP]: isIdentityGroupTemplateEnabled,
    [ConfigTemplateType.TUNNEL_PROFILE]: isTunnelProfileTemplateEnabled
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
    [ConfigTemplateType.TUNNEL_PROFILE]: false
  }

  return visibilityMap
}
