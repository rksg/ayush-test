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
    [ConfigTemplateType.VLAN_POOL]: isGA
  }

  return visibilityMap
}

export function useIsConfigTemplateOnByType (type: ConfigTemplateType): boolean {
  const visibilityMap = useConfigTemplateVisibilityMap()
  return visibilityMap[type]
}
