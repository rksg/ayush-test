import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }                                     from '@acx-ui/rc/utils'

export * from './ConfigTemplateLink'
export * from './utils'
export { ProtectedEnforceTemplateToggle } from './EnforceTemplateToggle'
export { EnforcedButton, useEnforcedStatus } from './EnforcedButton'

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
  const isBeta = useIsConfigTemplateBeta()
  const isGA = useIsConfigTemplateGA()
  const isExtraScope = useIsConfigTemplateExtra()
  const isEthernetPortTemplateEnabled = useIsSplitOn(Features.ETHERNET_PORT_TEMPLATE_TOGGLE)

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
    [ConfigTemplateType.ETHERNET_PORT_PROFILE]: isBeta && isEthernetPortTemplateEnabled
  }

  return visibilityMap
}

export function useIsConfigTemplateEnabledByType (type: ConfigTemplateType): boolean {
  const visibilityMap = useConfigTemplateVisibilityMap()
  return visibilityMap[type]
}
