import { getIntl } from '@acx-ui/utils'

import { CompatibilityDeviceEnum, IncompatibilityFeatureGroups, IncompatibilityFeatures } from '../models/CompatibilityEnum'

export const getCompatibilityDeviceTypeDisplayName = (deviceType: CompatibilityDeviceEnum) => {
  const { $t } = getIntl()

  switch(deviceType) {
    case CompatibilityDeviceEnum.EDGE:
      return $t({ defaultMessage: 'RUCKUS Edge' })
    case CompatibilityDeviceEnum.AP:
      return $t({ defaultMessage: 'Wi-Fi' })
    case CompatibilityDeviceEnum.SWITCH:
      return $t({ defaultMessage: 'Switch' })
    default:
      return ''
  }
}

export const getCompatibilityFeatureDisplayName = (
  featureName?: IncompatibilityFeatures | IncompatibilityFeatureGroups
) => {
  const { $t } = getIntl()
  switch(featureName) {
    case IncompatibilityFeatures.HA_AA:
      return $t({ defaultMessage: 'High-availability’s active-active mode' })
    case IncompatibilityFeatures.EDGE_MDNS_PROXY:
      return $t({ defaultMessage: 'mDNS Proxy' })
    case IncompatibilityFeatures.PIN_DS:
      return $t({ defaultMessage: 'Distribution Switch' })
    case IncompatibilityFeatures.PIN_AS:
      return $t({ defaultMessage: 'Access Switch' })
    case IncompatibilityFeatures.ARP_TERMINATION:
      return $t({ defaultMessage: 'ARP Termination' })
    case IncompatibilityFeatures.TUNNEL_PROFILE, IncompatibilityFeatureGroups.TUNNEL_PROFILE:
      return $t({ defaultMessage: 'Tunnel Profile' })
    case IncompatibilityFeatures.DUAL_WAN:
      return $t({ defaultMessage: 'Dual WAN' })
    default:
      return featureName
  }
}
