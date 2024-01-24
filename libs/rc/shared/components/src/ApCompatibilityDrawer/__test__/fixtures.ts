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