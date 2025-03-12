import { ApModelFamily, ApModelFamilyType }                                                                       from '../../../../types/firmware'
import { ApCompatibilityResponse, FeatureSetResponse, IncompatibleFeatureLevelEnum, IncompatibleFeatureTypeEnum } from '../../../../types/venue'

export const mockApCompatibilitiesVenue: ApCompatibilityResponse = {
  apCompatibilities: [{
    id: '8caa8f5e01494b5499fa156a6c565138',
    incompatibleFeatures: [ {
      featureName: 'EXAMPLE-FEATURE-1',
      requiredFw: '7.0.0.0.123',
      supportedModelFamilies: ['Wi-Fi 6'],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }
    ],
    total: 1,
    incompatible: 1
  }, {
    id: '8caa8f5e01494b5499fa156a6c565122',
    incompatibleFeatures: [ {
      featureName: 'EXAMPLE-FEATURE-3',
      requiredFw: '6.2.3.103.250',
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }],
    total: 1,
    incompatible: 1
  }]
}

export const mockFeatureCompatibilities: FeatureSetResponse = {
  featureSets: [{
    featureName: 'EXAMPLE-FEATURE-3',
    featureType: IncompatibleFeatureTypeEnum.WIFI,
    featureLevel: IncompatibleFeatureLevelEnum.VENUE,
    requirements: [{
      firmware: '6.2.3.103.252',
      models: ['R750', 'R770']
    }]
  }],
  page: 1,
  totalCount: 1
}

export const mockApModelFamilies: ApModelFamily[] = [{
  name: ApModelFamilyType.WIFI_11AC_1,
  displayName: '11ac wave 1',
  apModels: [
    'R730', 'R310', 'T300', 'T301N',
    'T300E', 'R500', 'R600', 'T301S'
  ]
}, {
  name: ApModelFamilyType.WIFI_11AC_2,
  displayName: '11ac wave 2',
  apModels: [
    'H510', 'R510', 'M510', 'T710',
    'T310S', 'T610', 'T310N', 'T710S',
    'R710', 'R320', 'T310C', 'R720',
    'T610S', 'T310D', 'E510', 'H320',
    'R610'
  ]
}, {
  name: ApModelFamilyType.WIFI_6,
  displayName: 'Wi-Fi 6',
  apModels: [
    'R750', 'R850', 'T750SE', 'T350SE',
    'T750', 'R350:R350E', 'T350C', 'T350D',
    'R350', 'R650', 'R550', 'H350', 'H550'
  ]
}, {
  name: ApModelFamilyType.WIFI_6E,
  displayName: 'Wi-Fi 6E',
  apModels: [ 'R760', 'R560' ]
}, {
  name: ApModelFamilyType.WIFI_7,
  displayName: 'Wi-Fi 7',
  apModels: [ 'R770', 'H670', 'T670SN', 'T670', 'R670']
}]