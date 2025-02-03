import {
  ApCompatibility,
  ApFeatureSet,
  ApIncompatibleDevice,
  ApIncompatibleFeature,
  EdgeCompatibilityFixtures
} from '@acx-ui/rc/utils'

const { mockEdgeCompatibilitiesVenue } = EdgeCompatibilityFixtures

export const transformedMockEdgeCompatibilitiesVenue = {
  compatibilities: mockEdgeCompatibilitiesVenue?.compatibilities?.map(item => ({
    id: item.id,
    total: item.total,
    incompatible: item.incompatible,
    incompatibleFeatures: item.incompatibleFeatures?.map(incompatibleFeature => ({
      featureName: incompatibleFeature.featureRequirement.featureName,
      requiredFw: incompatibleFeature.featureRequirement.requiredFw,
      incompatibleDevices: incompatibleFeature.incompatibleDevices as ApIncompatibleDevice[]
    } as ApIncompatibleFeature))
  } as ApCompatibility))
}

export const mockApFeatureCompatibilities: ApFeatureSet = {
  featureName: 'SD-LAN',
  requiredFw: '7.0.0.0',
  supportedModelFamilies: ['Wi-Fi 7']
}


export const mockVenuelist = {
  totalCount: 10,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '8caa8f5e01494b5499fa156a6c565138',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    }
  ]
}