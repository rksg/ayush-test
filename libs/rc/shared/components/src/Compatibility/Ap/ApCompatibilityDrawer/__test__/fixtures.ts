import {
  ApCompatibilityResponse,
  ApFeatureSet,
  ApModelFamily,
  ApModelFamilyType,
  CompatibilityResponse,
  FeatureSetResponse,
  IncompatibleFeatureLevelEnum,
  IncompatibleFeatureTypeEnum
} from '@acx-ui/rc/utils'

export const mockVenuelist = {
  totalCount: 10,
  page: 1,
  data: [{
    city: 'New York',
    country: 'United States',
    description: 'My-Venue',
    id: '8caa8f5e01494b5499fa156a6c565138',
    latitude: '40.769141',
    longitude: '-73.9429713',
    name: 'My-Venue',
    status: '1_InSetupPhase',
    aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
  }]
}

/** The fake date for the old APIs  **/
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
    }
  ]
}

export const mockApFeatureCompatibilities: ApFeatureSet = {
  featureName: 'EXAMPLE-FEATURE-3',
  requiredFw: '6.2.3.103.251',
  supportedModelFamilies: ['Wi-Fi 6']
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

/** The fake date for the new APIs  **/
export const mockVenueApCompatibilities: CompatibilityResponse = {
  compatibilities: [{
    id: '8caa8f5e01494b5499fa156a6c565138',
    incompatibleFeatures: [{
      featureName: 'EXAMPLE-FEATURE-1',
      featureType: IncompatibleFeatureTypeEnum.WIFI,
      featureLevel: IncompatibleFeatureLevelEnum.VENUE,
      requirements: [{
        firmware: '7.0.0.0.123',
        models: ['R750', 'R770']
      }],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }],
    total: 1,
    incompatible: 1
  },{
    id: '8caa8f5e01494b5499fa156a6c565122',
    incompatibleFeatures: [{
      featureName: 'EXAMPLE-FEATURE-3',
      featureType: IncompatibleFeatureTypeEnum.WIFI,
      featureLevel: IncompatibleFeatureLevelEnum.VENUE,
      requirements: [{
        firmware: '6.2.3.103.250',
        models: ['R750', 'R770']
      }],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }],
    total: 1,
    incompatible: 1
  }
  ],
  page: 1,
  totalCount: 2
}

export const mockNetworkApCompatibilities: CompatibilityResponse = {
  compatibilities: [{
    id: 'c9d5f4c771c34ad2898f7078cebbb191',
    incompatibleFeatures: [{
      featureName: 'EXAMPLE-FEATURE-3',
      featureType: IncompatibleFeatureTypeEnum.WIFI,
      featureLevel: IncompatibleFeatureLevelEnum.WIFI_NETWORK,
      requirements: [{
        firmware: '6.2.3.103.251',
        models: ['R750', 'R770']
      }],
      incompatibleDevices: [{
        firmware: '6.2.3.103.233',
        model: 'R550',
        count: 1
      }]
    }],
    total: 1,
    incompatible: 1
  }],
  page: 1,
  totalCount: 1
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

export const mockedFirmwareVenuesPerApModel = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '90b0b0cd6c3a44a894fe73e210b1a4c1',
      name: 'venueBBB-upToDate',
      isApFirmwareUpToDate: true,
      currentApFirmwares: [
        { apModel: 'R550', firmware: '7.0.0.104.1220' }
      ],
      lastScheduleUpdate: '2024-02-22T14:00:01.099-08:00'
    }
  ]
}