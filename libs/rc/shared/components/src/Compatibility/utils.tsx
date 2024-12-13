import { ApCompatibility, ApCompatibilityResponse, ApIncompatibleFeature, Compatibility, CompatibilityDeviceEnum, IncompatibilityFeatures, IncompatibleFeature, IncompatibleFeatureTypeEnum, isEdgeCompatibilityFeature } from '@acx-ui/rc/utils'

// for old API
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
    const isEdgeFeature = incompatibleFeature.featureType === IncompatibleFeatureTypeEnum.EDGE
    const deviceType = isEdgeFeature ? CompatibilityDeviceEnum.EDGE : CompatibilityDeviceEnum.AP
    if (!deviceMap[deviceType]) deviceMap[deviceType] = []
    deviceMap[deviceType].push(incompatibleFeature)
  })

  return deviceMap
}


// for old API
// eslint-disable-next-line max-len
export const mergeFilterApCompatibilitiesResultByRequiredFeatures = (results: ApCompatibilityResponse[], requiredFeatures: IncompatibilityFeatures[]): ApCompatibility => {
  const merged = { incompatible: 0 } as ApCompatibility

  const incompatibleFeatures: ApIncompatibleFeature[] = []

  results.forEach(result => {
    const apCompatibility = result.apCompatibilities[0]
    if (merged.incompatible < apCompatibility.incompatible) {

      merged.id = apCompatibility.id
      merged.incompatible = apCompatibility.incompatible
      merged.total = apCompatibility.total
    }

    incompatibleFeatures.push(...((apCompatibility.incompatibleFeatures
      ?.filter(feature =>
        requiredFeatures.includes(feature.featureName as IncompatibilityFeatures)
      )) ?? []))
  })

  merged.incompatibleFeatures = incompatibleFeatures
  return merged
}