import { ApCompatibilityResponse, ApFeatureSet } from '@acx-ui/rc/utils'

export const mockApCompatibilitiesVenue: ApCompatibilityResponse = {
  apCompatibilities: [{
    id: '8caa8f5e01494b5499fa156a6c565138',
    incompatibleFeatures: [ {
      featureName: 'EXAMPLE-FEATURE-1',
      requiredFw: '7.0.0.0.123',
      requiredModel: ['11be'],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }
    ],
    total: 1,
    incompatible: 1
  },{
    id: '8caa8f5e01494b5499fa156a6c565122',
    incompatibleFeatures: [ {
      featureName: 'EXAMPLE-FEATURE-3',
      requiredFw: '6.2.3.103.250',
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }
    ],
    total: 1,
    incompatible: 1
  }
  ]
}

export const mockApCompatibilitiesNetwork: ApCompatibilityResponse = {
  apCompatibilities: [
    {
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      incompatibleFeatures: [ {
        featureName: 'EXAMPLE-FEATURE-3',
        requiredFw: '6.2.3.103.251',
        requiredModel: ['11be'],
        incompatibleDevices: [{
          firmware: '6.2.3.103.233',
          model: 'R550',
          count: 1
        }]
      }
      ],
      total: 1,
      incompatible: 1
    }
  ]
}

export const mockFeatureCompatibilities: ApFeatureSet = {
  featureName: 'EXAMPLE-FEATURE-3',
  requiredFw: '6.2.3.103.251',
  requiredModel: ['11be']
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

export const mockActivityApCompatibilityTable = {
  data: [
    {
      id: '302002013530',
      name: 'AP-1',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013531',
      name: 'AP-2',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013532',
      name: 'AP-3',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013533',
      name: 'AP-4',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013534',
      name: 'AP-5',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013535',
      name: 'AP-6',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013536',
      name: 'AP-7',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013537',
      name: 'AP-8',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013538',
      name: 'AP-9',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    },
    {
      id: '302002013539',
      name: 'AP-10',
      incompatibleFeatures: [
        'feature x',
        'feature y',
        'feature z'
      ]
    }
  ],
  page: 1,
  impactedCount: 20,
  totalCount: 12
}