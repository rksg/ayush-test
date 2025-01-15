import { omit } from 'lodash'

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

  data.incompatibleFeatures?.forEach(feature => {
    const isEdgeFeature = feature.featureType === IncompatibleFeatureTypeEnum.EDGE
    const deviceType = isEdgeFeature ? CompatibilityDeviceEnum.EDGE : CompatibilityDeviceEnum.AP

    if (!deviceMap[deviceType]) {
      deviceMap[deviceType] = []
    }

    if (feature.featureGroup) {
      const existingFeature = deviceMap[deviceType].find(f =>
        f.featureName === feature.featureGroup && f.featureType === feature.featureType)

      if (existingFeature) {
        existingFeature.children = existingFeature.children ?? []
        existingFeature.children.push(omit(feature, 'featureType'))
      } else {
        deviceMap[deviceType].push({
          featureName: feature.featureGroup,
          featureType: feature.featureType,
          children: [omit(feature, 'featureType')]
        })
      }
    } else {
      deviceMap[deviceType].push(feature)
    }
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
