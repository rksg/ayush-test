import { ApCompatibility, ApIncompatibleFeature, Compatibility, CompatibilityDeviceEnum, IncompatibleFeature, isEdgeCompatibilityFeature } from '@acx-ui/rc/utils'

export const apCompatibilityDataGroupByFeatureDeviceType = (data: ApCompatibility):
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

export const compatibilityDataGroupByFeatureDeviceType = (data: Compatibility):
 Record<string, IncompatibleFeature[]> => {
  const deviceMap: Record<string, IncompatibleFeature[]> = {}

  data.incompatibleFeatures?.forEach(incompatibleFeature => {
    const isEdgeFeature = isEdgeCompatibilityFeature(incompatibleFeature.featureName)
    const deviceType = isEdgeFeature ? CompatibilityDeviceEnum.EDGE : CompatibilityDeviceEnum.AP
    if (!deviceMap[deviceType]) deviceMap[deviceType] = []
    deviceMap[deviceType].push(incompatibleFeature)
  })

  return deviceMap
}