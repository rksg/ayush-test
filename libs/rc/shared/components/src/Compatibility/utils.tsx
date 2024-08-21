import { ApCompatibility, ApIncompatibleFeature, CompatibilityDeviceEnum, isEdgeCompatibilityFeature } from '@acx-ui/rc/utils'

export const compatibilityDataGroupByFeatureDeviceType = (data: ApCompatibility):
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