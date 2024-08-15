import { defineMessage } from 'react-intl'

import { ApCompatibility, ApIncompatibleFeature, EdgeFeatureEnum } from '@acx-ui/rc/utils'

import { CompatibilityDeviceEnum } from './constants'

export const isEdgeCompatibilityFeature = (featureName: string) =>
  Object.values(EdgeFeatureEnum).includes(featureName as EdgeFeatureEnum)

export const compatibilityDataGroupByDeviceType = (data: ApCompatibility):
 Record<string, ApIncompatibleFeature[]> => {
  const deviceMap: Record<string, ApIncompatibleFeature[]> = {}

  data.incompatibleFeatures?.forEach(incompatibleFeature => {
    const isEdgeFeature = isEdgeCompatibilityFeature(incompatibleFeature.featureName)
    const deviceType = isEdgeFeature ? CompatibilityDeviceEnum.EDGE : CompatibilityDeviceEnum.AP
    if (!deviceMap[deviceType]) deviceMap[deviceType] = []
    deviceMap[deviceType].push(incompatibleFeature)
  })

  return deviceMap
}

export const getDeviceTypeDisplayName = (deviceType: CompatibilityDeviceEnum) => {
  return deviceType === CompatibilityDeviceEnum.EDGE
    ? defineMessage({ defaultMessage: 'SmartEdge' })
    : defineMessage({ defaultMessage: 'Wi-Fi' })
}
