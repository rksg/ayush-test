import { getIntl } from '@acx-ui/utils'

import { CompatibilityDeviceEnum, IncompatibilityFeatures } from '../models/CompatibilityEnum'

export const getCompatibilityDeviceTypeDisplayName = (deviceType: CompatibilityDeviceEnum) => {
  const { $t } = getIntl()

  switch(deviceType) {
    case CompatibilityDeviceEnum.EDGE:
      return $t({ defaultMessage: 'RUCKUS Edge' })
    case CompatibilityDeviceEnum.AP:
      return $t({ defaultMessage: 'Wi-Fi' })
    default:
      return ''
  }
}

export const getCompatibilityFeatureDisplayName = (featureName?: IncompatibilityFeatures) => {
  const { $t } = getIntl()
  switch(featureName) {
    case IncompatibilityFeatures.HA_AA:
      return $t({ defaultMessage: 'High-availability’s active-acitve mode' })
    default:
      return featureName
  }
}