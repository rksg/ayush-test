import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { ConfigTemplateType }                                     from '@acx-ui/rc/utils'

export function useConfigTemplateVisibilityMap (): Record<ConfigTemplateType, boolean> {
  const isBetaFFOn = useIsTierAllowed(TierFeatures.BETA_CONFIG_TEMPLATE)
  const isPhase2On = useIsSplitOn(Features.CONFIG_TEMPLATE)
  const visibilityMap: Record<ConfigTemplateType, boolean> = {
    [ConfigTemplateType.NETWORK]: isBetaFFOn,
    [ConfigTemplateType.VENUE]: isBetaFFOn,
    [ConfigTemplateType.DPSK]: isBetaFFOn,
    [ConfigTemplateType.RADIUS]: isBetaFFOn,
    [ConfigTemplateType.DHCP]: isBetaFFOn,
    [ConfigTemplateType.ACCESS_CONTROL_SET]: isBetaFFOn,
    [ConfigTemplateType.LAYER_2_POLICY]: isBetaFFOn,
    [ConfigTemplateType.LAYER_3_POLICY]: isBetaFFOn,
    [ConfigTemplateType.DEVICE_POLICY]: isBetaFFOn,
    [ConfigTemplateType.APPLICATION_POLICY]: isBetaFFOn,
    [ConfigTemplateType.VLAN_POOL]: isBetaFFOn && isPhase2On
  }

  return visibilityMap
}

export function useIsConfigTemplateOn (type: ConfigTemplateType): boolean {
  const visibilityMap = useConfigTemplateVisibilityMap()
  return visibilityMap[type]
}

interface ConfigTemplateVisibilityControllerProps {
  type: ConfigTemplateType
  children: React.ReactNode
}
// eslint-disable-next-line max-len
export function ConfigTemplateVisibilityController (props: ConfigTemplateVisibilityControllerProps) {
  const { type, children } = props
  const isOn = useIsConfigTemplateOn(type)
  return <>{ isOn && children }</>
}
