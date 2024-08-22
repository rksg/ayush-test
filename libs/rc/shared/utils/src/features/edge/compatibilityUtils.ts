import { IncompatibilityFeatures } from '../../models/CompatibilityEnum'
import { EdgeFeatureEnum }         from '../../models/EdgeEnum'

export const isApRelatedEdgeFeature = (featureName: IncompatibilityFeatures): boolean => {
  switch(featureName) {
    case IncompatibilityFeatures.SD_LAN:
    case IncompatibilityFeatures.TUNNEL_PROFILE:
      return true
    default:
      return false
  }
}

export const isEdgeCompatibilityFeature = (featureName: string) =>
  Object.values(EdgeFeatureEnum).includes(featureName as EdgeFeatureEnum)

// eslint-disable-next-line max-len
export const edgeSdLanRequiredFeatures = [IncompatibilityFeatures.SD_LAN, IncompatibilityFeatures.TUNNEL_PROFILE]
