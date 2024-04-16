import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }                                     from '@acx-ui/rc/utils'

export * from './ConfigTemplateLink'

export function useIsConfigTemplateBeta (): boolean {
  return useIsTierAllowed(TierFeatures.BETA_CONFIG_TEMPLATE)
}

export function useIsConfigTemplateGA (): boolean {
  const isBeta = useIsConfigTemplateBeta()
  const isGA = useIsSplitOn(Features.CONFIG_TEMPLATE)
  return isBeta && isGA
}

export function useConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const isBeta = useIsConfigTemplateBeta()
  const isGA = useIsConfigTemplateGA()
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
    [ConfigTemplateType.PORTAL]: isGA,
    [ConfigTemplateType.VLAN_POOL]: isGA,
    [ConfigTemplateType.WIFI_CALLING]: isGA,
    [ConfigTemplateType.CLIENT_ISOLATION]: false, // Not supported in the current scope
    [ConfigTemplateType.ROGUE_AP_DETECTION]: true // Not supported in the current scope
  }

  return visibilityMap
}

export function useIsConfigTemplateEnabledByType (type: ConfigTemplateType): boolean {
  const visibilityMap = useConfigTemplateVisibilityMap()
  return visibilityMap[type]
}
