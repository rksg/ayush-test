import { EdgeCompatibilityFeatureEnum, IncompatibilityFeatures } from '../../models/CompatibilityEnum'
import { VenueEdgeCompatibilitiesResponse }                      from '../../types/edge'

export const isApRelatedEdgeFeature = (featureName: IncompatibilityFeatures): boolean => {
  switch(featureName) {
    case IncompatibilityFeatures.SD_LAN:
    case IncompatibilityFeatures.TUNNEL_PROFILE:
    case IncompatibilityFeatures.PIN:
      return true
    default:
      return false
  }
}
export const isSwitchRelatedEdgeFeature = (featureName: IncompatibilityFeatures): boolean => {
  switch(featureName) {
    case IncompatibilityFeatures.PIN:
      return true
    default:
      return false
  }
}

export const isEdgeCompatibilityFeature = (featureName: string) =>
  Object.values(EdgeCompatibilityFeatureEnum).includes(featureName as EdgeCompatibilityFeatureEnum)

// eslint-disable-next-line max-len
export const edgeSdLanRequiredFeatures = [IncompatibilityFeatures.SD_LAN, IncompatibilityFeatures.TUNNEL_PROFILE]

export const retrievedEdgeCompatibilitiesOptions = (
  response?: VenueEdgeCompatibilitiesResponse
) => {
  const data = response?.compatibilities
  const compatibilitiesFilterOptions: {
    key: string;
    value: string;
    label: string;
  }[] = []

  if (data?.[0]) {
    const { incompatibleFeatures, incompatible } = data[0]
    if (incompatible > 0) {
      incompatibleFeatures?.forEach((feature) => {
        const { featureRequirement, incompatibleDevices } = feature
        const fwVersions: string[] = []
        incompatibleDevices?.forEach((device) => {
          if (fwVersions.indexOf(device.firmware) === -1) {
            fwVersions.push(device.firmware)
          }
        })
        compatibilitiesFilterOptions.push({
          key: fwVersions.join(','),
          value: featureRequirement.featureName,
          label: featureRequirement.featureName
        })
      })
    }
    return {
      compatibilitiesFilterOptions,
      apCompatibilities: data,
      incompatible
    }
  }
  return {
    compatibilitiesFilterOptions,
    apCompatibilities: data,
    incompatible: 0
  }
}
