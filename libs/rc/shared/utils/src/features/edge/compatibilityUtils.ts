/* eslint-disable max-len */
import { EdgeCompatibilityFeatureEnum, IncompatibilityFeatures }                                                                        from '../../models/CompatibilityEnum'
import { EdgeIncompatibleFeature, EdgeIncompatibleFeatureV1_1, VenueEdgeCompatibilitiesResponse, VenueEdgeCompatibilitiesResponseV1_1 } from '../../types/edge'

export const isApRelatedEdgeFeature = (featureName: IncompatibilityFeatures): boolean => {
  switch(featureName) {
    case IncompatibilityFeatures.SD_LAN:
    case IncompatibilityFeatures.TUNNEL_PROFILE:
    case IncompatibilityFeatures.NAT_TRAVERSAL:
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

export const edgeSdLanRequiredFeatures = [IncompatibilityFeatures.SD_LAN, IncompatibilityFeatures.TUNNEL_PROFILE, IncompatibilityFeatures.NAT_TRAVERSAL]
export const edgePinRequiredFeatures = [IncompatibilityFeatures.PIN, IncompatibilityFeatures.TUNNEL_PROFILE]

export const retrievedEdgeCompatibilitiesOptions = (
  response?: VenueEdgeCompatibilitiesResponse | VenueEdgeCompatibilitiesResponseV1_1
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
        if (feature.hasOwnProperty('featureType')
          && feature.hasOwnProperty('featureLevel')) {
          const { featureName, incompatibleDevices } = feature as EdgeIncompatibleFeatureV1_1
          const fwVersions: string[] = []
          incompatibleDevices?.forEach((device) => {
            if (fwVersions.indexOf(device.firmware) === -1) {
              fwVersions.push(device.firmware)
            }
          })
          compatibilitiesFilterOptions.push({
            key: featureName + ',' + fwVersions.join(','),
            value: featureName,
            label: featureName
          })
        } else {
          const { featureRequirement, incompatibleDevices } = feature as EdgeIncompatibleFeature
          const fwVersions: string[] = []
          incompatibleDevices?.forEach((device) => {
            if (fwVersions.indexOf(device.firmware) === -1) {
              fwVersions.push(device.firmware)
            }
          })
          compatibilitiesFilterOptions.push({
            key: featureRequirement.featureName + ',' + fwVersions.join(','),
            value: featureRequirement.featureName,
            label: featureRequirement.featureName
          })
        }
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
