/* eslint-disable max-len */
import {
  ExternalAntenna,
  GuestNetworkTypeEnum,
  PropertyConfigs,
  PropertyConfigStatus,
  PropertyUnit,
  PropertyUnitStatus,
  RadioEnum,
  RadioTypeEnum,
  WlanSecurityEnum,
  FacilityEnum,
  FlowLevelEnum,
  PriorityEnum,
  ProtocolEnum,
  PersonaGroup,
  NewTableResult,
  NewTablePageable,
  ResidentPortal,
  ConnectionMetering,
  BillingCycleType,
  TemplateScope,
  MessageType,
  PassphraseFormatEnum,
  MacRegistrationPool,
  NetworkTypeEnum,
  BasicServiceSetPriorityEnum,
  RfBandUsageEnum,
  BssMinimumPhyRateEnum,
  PhyTypeConstraintEnum,
  ManagementFrameMinimumPhyRateEnum,
  MtuTypeEnum,
  SoftGreViewData,
  IsolatePacketsTypeEnum,
  Persona
} from '@acx-ui/rc/utils'

export const mockedVenueId = '__MOCKED_VENUE_ID__'

export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '2c16284692364ab6a01f4c60f5941836',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    },
    {
      city: 'Sunnyvale, California',
      country: 'United States',
      description: '',
      id: 'a919812d11124e6c91b56b9d71eacc31',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'test',
      status: '1_InSetupPhase',
      switchClients: 2,
      switches: 1,
      edges: 3,
      clients: 1
    }
  ]
}

export const venueDetailHeaderData = {
  activeNetworkCount: 1,
  aps: {
    totalApCount: 1
  },
  totalClientCount: 2,
  venue: {
    name: 'testVenue'
  }
}

export const venueApCompatibilitiesData = {
  apCompatibilities: [
    {
      id: '8caa8f5e01494b5499fa156a6c565138',
      incompatibleFeatures: [ {
        featureName: 'EXAMPLE-FEATURE-1',
        requiredFw: '7.0.0.0.123',
        supportedModelFamilies: ['Wi-Fi 6'],
        incompatibleDevices: [{
          firmware: '6.2.3.103.233',
          model: 'R550',
          count: 1
        }
        ]
      }
      ],
      total: 1,
      incompatible: 1
    }
  ]
}

export const apCompatibilitiesFilterData = [
  {
    key: '6.2.3.103.233',
    value: 'EXAMPLE-FEATURE-1',
    label: 'EXAMPLE-FEATURE-1'
  }
]

export const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '2022-07-08T04:59:22.351+00:00',
  description: 'My-Venue',
  floorPlans: [],
  id: mockedVenueId,
  name: 'My-Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}

export const venueCaps = {
  apModels: [{
    ledOn: true,
    model: 'E510'
  }, {
    ledOn: true,
    model: 'H320',
    canSupportPoeMode: false,
    canSupportPoeOut: false,
    lanPortPictureDownloadUrl: 'xxxxxxx/h320.jpg',
    lanPorts: [{
      defaultType: 'ACCESS',
      id: '1',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1'
    }, {
      defaultType: 'ACCESS',
      id: '2',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1'
    }, {
      defaultType: 'TRUNK',
      id: '3',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: true,
      untagId: 1,
      vlanMembers: '1-4094'
    }]
  }, {
    ledOn: true,
    model: 'T750',
    canSupportPoeMode: true,
    canSupportPoeOut: true,
    lanPortPictureDownloadUrl: 'xxxxxxx/t750.jpg',
    lanPorts: [{
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: true,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }, {
      defaultType: 'TRUNK',
      id: '2',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }, {
      defaultType: 'TRUNK',
      id: '3',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }],
    poeModeCapabilities: [
      'Auto',
      '802.3at',
      '802.3bt-Class_5',
      '802.3bt-Class_6',
      '802.3bt-Class_7'
    ]
  }],
  version: '6.0.0.x.xxx'
}

export const venueLed = [
  {
    ledEnabled: true,
    model: 'E510'
  }
]

export const venueApModels = [
  {
    models: []
  }
]

export const venueBssColoring = {
  bssColoringEnabled: true
}

export const venueApManagementVlan = {
  vlanOverrideEnabled: true,
  vlanId: 7
}

export const autocompleteResult = {
  address_components: [
    {
      long_name: '350',
      short_name: '350',
      types: ['street_number']
    },
    {
      long_name: 'West Java Drive',
      short_name: 'W Java Dr',
      types: ['route']
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political']
    },
    {
      long_name: '94089',
      short_name: '94089',
      types: ['postal_code']
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: ['postal_code_suffix']
    }
  ],
  // eslint-disable-next-line max-len
  adr_address:
    "<span class='street-address'>350 W Java Dr</span>, <span class='locality'>Sunnyvale</span>, <span class='region'>CA</span> <span class='postal-code'>94089-1026</span>, <span class='country-name'>USA</span>",
  formatted_address: '350 W Java Dr, Sunnyvale, CA 94089, USA',
  geometry: {
    location: {
      lat: () => 37.4112751,
      lng: () => -122.0191908
    },
    viewport: {
      northeast: {
        lat: 37.4128056302915,
        lng: -122.0180266697085
      },
      southwest: {
        lat: 37.4101076697085,
        lng: -122.0207246302915
      }
    }
  },
  icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png',
  icon_background_color: '#7B9EB0',
  icon_mask_base_uri:
    'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '350 W Java Dr',
  place_id: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  reference: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  types: ['premise'],
  // eslint-disable-next-line max-len
  url: 'https://maps.google.com/?q=350+W+Java+Dr,+Sunnyvale,+CA+94089,+USA&ftid=0x808fb7bec8fb92a7:0x40bb09e0f908a40a',
  utc_offset: -420,
  vicinity: 'Sunnyvale'
}

export const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  timeZoneId: 'America/Los_Angeles',
  timeZoneName: 'Pacific Daylight Time'
}

export const venueLanPorts = [{
  lanPorts: [{ type: 'TRUNK', untagId: 1, vlanMembers: '1-4094', portId: '1', enabled: true }],
  model: 'E510'
}, {
  lanPorts: [
    { type: 'ACCESS', untagId: 1, vlanMembers: '1', portId: '1', enabled: false },
    { type: 'ACCESS', untagId: 1, vlanMembers: '1', portId: '2', enabled: true },
    { type: 'TRUNK', untagId: 1, vlanMembers: '1-4094', portId: '3', enabled: true }
  ],
  model: 'H320'
}, {
  lanPorts: [
    { type: 'TRUNK', untagId: 1, vlanMembers: '1-4094', portId: '1', enabled: true },
    { type: 'TRUNK', untagId: 1, vlanMembers: '1-4094', portId: '2', enabled: true },
    { type: 'TRUNK', untagId: 1, vlanMembers: '1-4094', portId: '3', enabled: true }
  ],
  model: 'T750',
  poeMode: 'Auto',
  poeOut: false
}]

export const mockEthProfiles = {
  fields: [
    'id',
    'name',
    'type',
    'untagId',
    'vlanMembers',
    'isDefault',
    'venueIds',
    'venueActivations'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'ed4b396d848e465d8044064ff3da9d33',
      name: 'Default Trunk',
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      isDefault: true,
      venueIds: ['venue-id'],
      venueActivations: [
        {
          venueId: 'venue-id',
          apModel: 'T750',
          portId: 1
        }
      ]
    },
    {
      id: 'd17d0b68b34249ff85376ebfaa8a87d5',
      name: 'Default Access',
      type: 'ACCESS',
      untagId: 1,
      vlanMembers: '1',
      isDefault: true,
      venueIds: ['venue-id'],
      venueActivations: [
        {
          venueId: 'venue-id',
          apModel: 'T750',
          portId: 2
        }
      ]
    }
  ]
}
export const mockDefaultTrunkEthertnetPortProfileId = 'mockdefaultTrunkEthertnetPortProfileId'
export const mockDefaultTunkEthertnetPortProfile = {
  id: mockDefaultTrunkEthertnetPortProfileId,
  tenantId: 'tenant-id',
  name: 'Default Trunk',
  type: 'TRUNK',
  untagId: 1,
  vlanMembers: '1-4094',
  authType: 'DISABLED',
  isDefault: true
}

export const venueSetting = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  wifiFirmwareVersion: '6.2.0.103.486',
  countryCode: 'US',
  mesh: {
    enabled: true,
    ssid: 'Mesh-test',
    passphrase: '1234'
  },
  bandBalancing: {
    enabled: false,
    clientPercent24: 25
  },
  radioCustomization: {
    radioParams6G: {
      method: 'CHANNELFLY',
      scanInterval: 20,
      allowedChannels:
        // eslint-disable-next-line max-len
        [
          '1',
          '5',
          '9',
          '13',
          '17',
          '21',
          '25',
          '29',
          '33',
          '37',
          '41',
          '45',
          '49',
          '53',
          '57',
          '61',
          '65',
          '69',
          '73',
          '77',
          '81',
          '85',
          '89',
          '93',
          '97',
          '101',
          '105',
          '109',
          '113',
          '117',
          '121',
          '125',
          '129',
          '133',
          '137',
          '141',
          '145',
          '149',
          '153',
          '157',
          '161',
          '165',
          '169',
          '173',
          '177',
          '181',
          '185',
          '189',
          '193',
          '197',
          '201',
          '205',
          '209',
          '213',
          '217',
          '221'
        ],
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      changeInterval: 33,
      txPower: 'MAX'
    },
    radioParamsDual5G: {
      inheritParamsLower5G: true,
      radioParamsLower5G: {
        allowedIndoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
        allowedOutdoorChannels: [
          '36',
          '40',
          '44',
          '48',
          '52',
          '56',
          '60',
          '64'
        ],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      },
      inheritParamsUpper5G: true,
      radioParamsUpper5G: {
        // eslint-disable-next-line max-len
        allowedIndoorChannels: [
          '100',
          '104',
          '108',
          '112',
          '116',
          '120',
          '124',
          '128',
          '132',
          '136',
          '149',
          '153',
          '157',
          '161'
        ],
        // eslint-disable-next-line max-len
        allowedOutdoorChannels: [
          '100',
          '104',
          '108',
          '112',
          '116',
          '120',
          '124',
          '128',
          '132',
          '136',
          '149',
          '153',
          '157',
          '161'
        ],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      }
    },
    radioParams24G: {
      allowedChannels: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11'
      ],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    },
    radioParams50G: {
      combineChannels: false,
      // eslint-disable-next-line max-len
      allowedIndoorChannels: [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '149',
        '153',
        '157',
        '161'
      ],
      // eslint-disable-next-line max-len
      allowedOutdoorChannels: [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '149',
        '153',
        '157',
        '161'
      ],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    }
  },
  denialOfServiceProtection: {
    enabled: false,
    blockingPeriod: 60,
    failThreshold: 5,
    checkPeriod: 30
  },
  syslog: {
    enabled: false,
    port: 514,
    facility: 'KEEP_ORIGINAL',
    priority: 'INFO',
    protocol: 'UDP',
    flowLevel: 'CLIENT_FLOW',
    secondaryPort: 514,
    secondaryProtocol: 'TCP'
  },
  dhcpServiceSetting: {
    enabled: false,
    mode: 'EnableOnEachAPs',
    wanPortSelectionMode: 'Dynamic'
  },
  rogueAp: {
    enabled: false,
    reportThreshold: 0
  },
  enableClientIsolationAllowlist: false,
  id: 'f892848466d047798430de7ac234e940'
}

export const serviceProfile = {
  serviceProfileId: 'serviceProfileId1',
  enabled: true,
  dhcpServiceAps: [
    { serialNumber: '150000000400', role: 'PrimaryServer' },
    { serialNumber: '150000000401', role: 'BackupServer' },
    { serialNumber: '150000000402', role: 'NatGateway' },
    { serialNumber: '150000000403', role: 'NatGateway' },
    { serialNumber: '150000000404', role: 'NatGateway' }
  ]
}

export const venueNetworkList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'test_1',
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'test_1',
      venues: {
        count: 0,
        names: [],
        ids: []
      },
      aps: 0,
      description: '',
      clients: 0,
      captiveType: GuestNetworkTypeEnum.ClickThrough,
      activated: { isActivated: false }
    },
    {
      name: 'test_2',
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      vlan: 1,
      nwSubType: 'aaa',
      ssid: 'test_2',
      venues: {
        count: 0,
        names: [],
        ids: []
      },
      aps: 0,
      description: '',
      clients: 0,
      captiveType: GuestNetworkTypeEnum.ClickThrough,
      activated: { isActivated: false }
    }
  ]
}

export const venueNetworkApCompatibilitiesData = {
  apCompatibilities: [
    {
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      incompatibleFeatures: [ {
        featureName: 'EXAMPLE-FEATURE-1',
        requiredFw: '7.0.0.0.123',
        supportedModelFamilies: ['Wi-Fi 6'],
        incompatibleDevices: [{
          firmware: '6.2.3.103.233',
          model: 'R550',
          count: 1
        }
        ]
      }
      ],
      total: 1,
      incompatible: 1
    },{
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      incompatibleFeatures: [],
      total: 1,
      incompatible: 0
    }
  ]
}


export const venuesApCompatibilitiesData = {
  apCompatibilities: [
    {
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      incompatibleFeatures: [ {
        featureName: 'EXAMPLE-FEATURE-1',
        requiredFw: '7.0.0.0.123',
        supportedModelFamilies: ['Wi-Fi 6'],
        incompatibleDevices: [{
          firmware: '6.2.3.103.233',
          model: 'R550',
          count: 1
        }
        ]
      }
      ],
      total: 1,
      incompatible: 1
    },{
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      incompatibleFeatures: [],
      total: 1,
      incompatible: 0
    }
  ]
}

export const venueNetworkApGroupData = [
  {
    venueId: '45aa5ab71bd040be8c445be8523e0b6c',
    networkId: 'd556bb683e4248b7a911fdb40c307aa5',
    apGroups: [
      {
        id: 'test',
        apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
        radio: RadioEnum.Both,
        isDefault: true,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationError: false
      }
    ],
    isAllApGroups: false,
    allApGroupsRadio: RadioEnum.Both
  },
  {
    venueId: '45aa5ab71bd040be8c445be8523e0b6c',
    networkId: 'cd922ec00f744a16b4b784f3305ec0aa',
    apGroups: [
      {
        apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
        radio: RadioEnum.Both,
        isDefault: true,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationError: false
      }
    ],
    isAllApGroups: false,
    allApGroupsRadio: RadioEnum.Both
  }
]

export const venueNetworkApGroup = {
  response: venueNetworkApGroupData
}


export const networkDeepList = {
  response: [
    {
      type: NetworkTypeEnum.AAA,
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3,
        advancedCustomization: {
          bssPriority: BasicServiceSetPriorityEnum.HIGH,
          userUplinkRateLimiting: 0,
          userDownlinkRateLimiting: 0,
          totalUplinkRateLimiting: 0,
          totalDownlinkRateLimiting: 0,
          maxClientsOnWlanPerRadio: 100,
          enableBandBalancing: true,
          clientIsolation: false,
          clientIsolationOptions: {
            autoVrrp: false
          },
          hideSsid: false,
          forceMobileDeviceDhcp: false,
          clientLoadBalancingEnable: true,
          enableAaaVlanOverride: true,
          directedThreshold: 5,
          enableNeighborReport: true,
          enableFastRoaming: false,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: RfBandUsageEnum.BOTH,
            bssMinimumPhyRate: BssMinimumPhyRateEnum._default,
            phyTypeConstraint: PhyTypeConstraintEnum.OFDM,
            managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum._6
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          accessControlEnable: false,
          respectiveAccessControl: false,
          applicationPolicyEnable: false,
          l2AclEnable: false,
          l3AclEnable: false,
          wifiCallingEnabled: false,
          proxyARP: false,
          enableAirtimeDecongestion: false,
          enableJoinRSSIThreshold: false,
          joinRSSIThreshold: -85,
          enableTransientClientManagement: false,
          joinWaitTime: 30,
          joinExpireTime: 300,
          joinWaitThreshold: 10,
          enableOptimizedConnectivityExperience: false,
          broadcastProbeResponseDelay: 15,
          rssiAssociationRejectionThreshold: -75,
          enableAntiSpoofing: false,
          enableArpRequestRateLimit: true,
          arpRequestRateLimit: 15,
          enableDhcpRequestRateLimit: true,
          dhcpRequestRateLimit: 15,
          dnsProxyEnabled: false,
          vlanPool: null
        },
        vlanId: 1,
        ssid: 'test_2',
        enabled: true,
        bypassCPUsingMacAddressAuthentication: false,
        bypassCNA: false
      },
      authRadius: {
        primary: {
          ip: '3.3.3.3',
          port: 1812,
          sharedSecret: 'dddddddd'
        },
        id: '03649e4122f74870b89d2a4517e09cfb'
      },
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      name: 'test_2',
      enableAuthProxy: false,
      enableAccountingProxy: false,
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      venues: []
    },
    {
      type: NetworkTypeEnum.PSK,
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA2Personal,
        advancedCustomization: {
          bssPriority: BasicServiceSetPriorityEnum.HIGH,
          userUplinkRateLimiting: 0,
          userDownlinkRateLimiting: 0,
          totalUplinkRateLimiting: 0,
          totalDownlinkRateLimiting: 0,
          maxClientsOnWlanPerRadio: 100,
          enableBandBalancing: true,
          clientIsolation: false,
          clientIsolationOptions: {
            autoVrrp: false
          },
          hideSsid: false,
          forceMobileDeviceDhcp: false,
          clientLoadBalancingEnable: true,
          directedThreshold: 5,
          enableNeighborReport: true,
          enableFastRoaming: false,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: RfBandUsageEnum.BOTH,
            bssMinimumPhyRate: BssMinimumPhyRateEnum._default,
            phyTypeConstraint: PhyTypeConstraintEnum.OFDM,
            managementFrameMinimumPhyRate: ManagementFrameMinimumPhyRateEnum._6
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          accessControlEnable: false,
          respectiveAccessControl: false,
          applicationPolicyEnable: false,
          l2AclEnable: false,
          l3AclEnable: false,
          wifiCallingEnabled: false,
          proxyARP: false,
          enableAirtimeDecongestion: false,
          enableJoinRSSIThreshold: false,
          joinRSSIThreshold: -85,
          enableTransientClientManagement: false,
          joinWaitTime: 30,
          joinExpireTime: 300,
          joinWaitThreshold: 10,
          enableOptimizedConnectivityExperience: false,
          broadcastProbeResponseDelay: 15,
          rssiAssociationRejectionThreshold: -75,
          enableAntiSpoofing: false,
          enableArpRequestRateLimit: true,
          arpRequestRateLimit: 15,
          enableDhcpRequestRateLimit: true,
          dhcpRequestRateLimit: 15,
          dnsProxyEnabled: false,
          vlanPool: null
        },
        macAddressAuthentication: false,
        macAuthMacFormat: 'UpperDash',
        managementFrameProtection: 'Disabled',
        vlanId: 1,
        ssid: 'test_1',
        enabled: true,
        passphrase: '15215215'
      },
      tenantId: 'f378d3ba5dd44e62bacd9b625ffec681',
      name: 'test_1',
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      venues: [{
        venueId: '3b2ffa31093f41648ed38ed122510029',
        id: '3b2ffa31093f41648ed38ed122510029',
        tripleBandEnabled: false,
        networkId: 'd556bb683e4248b7a911fdb40c307aa5',
        allApGroupsRadio: RadioEnum.Both,
        isAllApGroups: true,
        allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz]
      }]
    }
  ]
}

export const mockVenueNetworkData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'test_1',
      id: 'd556bb683e4248b7a911fdb40c307aa5',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'test_1',
      venues: { count: 0, names: [], ids: [] },
      aps: 0,
      description: '',
      clients: 0,
      activated: { isActivated: true, isDisabled: false, errors: [] },
      deepNetwork: networkDeepList.response[1],
      incompatible: 0
    },
    {
      name: 'test_2',
      id: 'cd922ec00f744a16b4b784f3305ec0aa',
      vlan: 1,
      nwSubType: 'aaa',
      ssid: 'test_2',
      venues: { count: 0, names: [], ids: [] },
      aps: 0,
      description: '',
      clients: 0,
      activated: { isActivated: false, isDisabled: false, errors: [] },
      deepNetwork: networkDeepList.response[0],
      incompatible: 0
    }
  ]
}

export const venueApsList = {
  fields: ['meshRole', 'serialNumber'],
  totalCount: 0,
  page: 1,
  data: []
}

export const venueDosProtection = {
  enabled: true,
  blockingPeriod: 50,
  failThreshold: 6,
  checkPeriod: 30
}

export const venueRogueAp = {
  enabled: true,
  reportThreshold: 0,
  roguePolicyId: '9700ca95e4be4a22857f0e4b621a685f'
}

export const venueApTlsEnhancedKey = {
  tlsKeyEnhancedModeEnabled: true
}

export const venueRoguePolicy = [
  {
    venues: [{ id: '3db73a30cd06490aaf4bca01a1eb8894', name: 'My-Venue' }],
    name: 'Default profile',
    rules: [
      {
        name: 'Same Network Rule',
        type: 'SameNetworkRule',
        classification: 'Malicious',
        priority: 1
      },
      {
        name: 'Mac Spoofing Rule',
        type: 'MacSpoofingRule',
        classification: 'Malicious',
        priority: 2
      },
      {
        name: 'SSID Spoofing Rule',
        type: 'SsidSpoofingRule',
        classification: 'Malicious',
        priority: 3
      },
      {
        name: 'RTS Abuse Rule',
        type: 'RTSAbuseRule',
        classification: 'Malicious',
        priority: 4
      },
      {
        name: 'CTS Abuse Rule',
        type: 'CTSAbuseRule',
        classification: 'Malicious',
        priority: 5
      },
      {
        name: 'Deauth Flood Rule',
        type: 'DeauthFloodRule',
        classification: 'Malicious',
        priority: 6
      },
      {
        name: 'Disassoc Flood Rule',
        type: 'DisassocFloodRule',
        classification: 'Malicious',
        priority: 7
      },
      {
        name: 'Excessive Power Rule',
        type: 'ExcessivePowerRule',
        classification: 'Malicious',
        priority: 8
      },
      {
        name: 'Null SSID Rule',
        type: 'NullSSIDRule',
        classification: 'Malicious',
        priority: 9
      },
      {
        name: 'Adhoc',
        type: 'AdhocRule',
        classification: 'Unclassified',
        priority: 10
      }
    ],
    id: '9700ca95e4be4a22857f0e4b621a685f'
  }
]

export const rogueApPolicyNotDefaultProfile = {
  venues: [
    {
      id: '3db73a30cd06490aaf4bca01a1eb8894',
      name: 'My-Venue'
    }
  ],
  name: 'roguePolicy1',
  rules: [
    {
      name: 'macSpoofing',
      type: 'MacSpoofingRule',
      classification: 'Malicious',
      priority: 2
    },
    {
      name: 'rule1',
      type: 'AdhocRule',
      classification: 'Malicious',
      priority: 1
    }
  ],
  id: '9700ca95e4be4a22857f0e4b621a685f'
}

export const venueRoguePolicyList = {
  data: [
    {
      name: 'Default profile',
      rules: [
        {
          name: 'Same Network Rule',
          type: 'SameNetworkRule',
          classification: 'Malicious',
          priority: 1
        },
        {
          name: 'Mac Spoofing Rule',
          type: 'MacSpoofingRule',
          classification: 'Malicious',
          priority: 2
        },
        {
          name: 'SSID Spoofing Rule',
          type: 'SsidSpoofingRule',
          classification: 'Malicious',
          priority: 3
        },
        {
          name: 'RTS Abuse Rule',
          type: 'RTSAbuseRule',
          classification: 'Malicious',
          priority: 4
        },
        {
          name: 'CTS Abuse Rule',
          type: 'CTSAbuseRule',
          classification: 'Malicious',
          priority: 5
        },
        {
          name: 'Deauth Flood Rule',
          type: 'DeauthFloodRule',
          classification: 'Malicious',
          priority: 6
        },
        {
          name: 'Disassoc Flood Rule',
          type: 'DisassocFloodRule',
          classification: 'Malicious',
          priority: 7
        },
        {
          name: 'Excessive Power Rule',
          type: 'ExcessivePowerRule',
          classification: 'Malicious',
          priority: 8
        },
        {
          name: 'Null SSID Rule',
          type: 'NullSSIDRule',
          classification: 'Malicious',
          priority: 9
        },
        {
          name: 'Adhoc',
          type: 'AdhocRule',
          classification: 'Unclassified',
          priority: 10
        }
      ],
      id: 'ebb16f640edf4272bc56aef4b37fb630'
    },
    {
      venues: [
        {
          id: '3db73a30cd06490aaf4bca01a1eb8894',
          name: 'My-Venue'
        }
      ],
      name: 'roguePolicy1',
      rules: [
        {
          name: 'rule1',
          type: 'AdhocRule',
          classification: 'Malicious',
          priority: 1
        },
        {
          name: 'macSpoofing',
          type: 'MacSpoofingRule',
          classification: 'Malicious',
          priority: 2
        }
      ],
      id: '9700ca95e4be4a22857f0e4b621a685f'
    }
  ],
  totalCount: 2
}

export const configProfiles = [
  {
    id: '771f6e6b21af43fa8879e10170114fc4',
    name: 'profile-cli01',
    profileType: 'CLI',
    venueCliTemplate: {
      cli: 'manager registrar\n bbb',
      id: '361a51cd00804f498b28eab9f7114227',
      name: 'profile-cli01',
      overwrite: false,
      switchModels: 'ICX7150-24'
    }
  },
  {
    id: '6a757409dc1f47c2ad48689db4a0846a',
    name: 'profile01',
    profileType: 'Regular',
    venues: ['My-Venue', 'My-Venue2']
  },
  {
    id: '69248dfe1d5b400199304447b45a1700',
    name: 'profile-cli03',
    profileType: 'CLI',
    venueCliTemplate: {
      cli: 'manager registrar\n profile-cli03 cli test',
      id: '3ace41aef9be4f4087baf0af96bbed67',
      name: 'profile-cli03',
      overwrite: false,
      switchModels: 'ICX7150-24F,ICX7850-48F,ICX7850-48FS'
    }
  },
  {
    id: '7d6efb0dec2d4a58a08056045982ef6a',
    name: 'profile-cli02',
    profileType: 'CLI',
    venueCliTemplate: {
      cli: 'manager registrar\n qqq',
      id: '1c5dca60d0b8464a9163436405ece945',
      name: 'profile-cli02',
      overwrite: false,
      switchModels: 'ICX7150-24,ICX7550-24P'
    },
    venues: ['Venue01']
  },
  {
    acls: [
      {
        aclType: 'standard',
        id: 'ae7ea5418aee4048b8122e2ae20a243b',
        name: 'aaa'
      }
    ],
    id: '74ee9d8bb08b47218926d9bc33f6167f',
    name: 'profile02',
    profileType: 'Regular',
    trustedPorts: [
      {
        id: '89892eff25b64ac0ada800f0e5cd736c',
        model: 'ICX7150-48',
        slots: [
          { slotNumber: 3, enable: true, option: '4X1/10G' },
          { slotNumber: 2, enable: true, option: '2X1G' },
          { slotNumber: 1, enable: true }
        ],
        trustPorts: ['1/1/1', '1/1/4'],
        trustedPortType: 'all',
        vlanDemand: false
      },
      {
        id: '2cdada96178343be93c6b8a998115259',
        model: 'ICX7850-48FS',
        slots: [
          { slotNumber: 2, enable: true, option: '8X40/100G' },
          { slotNumber: 1, enable: true }
        ],
        trustPorts: ['1/1/3'],
        trustedPortType: 'all',
        vlanDemand: false
      }
    ],
    vlans: [
      {
        arpInspection: false,
        id: '0abd832af3e542f58341c85cf180ab2b',
        igmpSnooping: 'passive',
        ipv4DhcpSnooping: true,
        multicastVersion: 3,
        spanningTreeProtocol: 'stp',
        vlanId: 2
      }
    ]
  }
]

export const venueSwitchSetting = [
  {
    cliApplied: false,
    id: '45aa5ab71bd040be8c445be8523e0b6c',
    name: 'My-Venue',
    profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
    switchLoginPassword: 'xxxxxxxxx',
    switchLoginUsername: 'admin',
    syslogEnabled: false
  },
  {
    cliApplied: true,
    dns: ['1.1.1.10'],
    id: '45aa5ab71bd040be8c445be8523e0b6c',
    name: 'My-Venue',
    profileId: [
      '771f6e6b21af43fa8879e10170114fc4',
      '69248dfe1d5b400199304447b45a1700'
    ],
    switchLoginPassword: 'xxxxxxxxx',
    switchLoginUsername: 'admin',
    syslogEnabled: false
  },
  {
    cliApplied: false,
    id: '45aa5ab71bd040be8c445be8523e0b6c',
    name: 'My-Venue',
    profileId: ['74ee9d8bb08b47218926d9bc33f6167f'],
    switchLoginPassword: 'xxxxxxxxx',
    switchLoginUsername: 'admin',
    syslogEnabled: false
  }
]

export const switchConfigProfile = [
  {
    id: '6a757409dc1f47c2ad48689db4a0846a',
    name: 'profile01',
    profileType: 'Regular',
    venues: ['45aa5ab71bd040be8c445be8523e0b6c']
  },
  {
    id: '74ee9d8bb08b47218926d9bc33f6167f',
    name: 'profile02',
    profileType: 'Regular',
    acls: [
      {
        aclRules: [
          {
            sequence: 65000,
            action: 'permit',
            source: 'any',
            id: 'c2a17d8e5ea048baa220a6ca1a68ad54'
          }
        ],
        name: 'test-acl',
        aclType: 'standard',
        id: 'ae7ea5418aee4048b8122e2ae20a243b'
      }
    ],
    trustedPorts: [
      {
        id: '89892eff25b64ac0ada800f0e5cd736c',
        model: 'ICX7150-48',
        slots: [
          { slotNumber: 3, enable: true, option: '4X1/10G' },
          { slotNumber: 2, enable: true, option: '2X1G' },
          { slotNumber: 1, enable: true }
        ],
        trustPorts: ['1/1/1', '1/1/4'],
        trustedPortType: 'all',
        vlanDemand: false
      },
      {
        id: '2cdada96178343be93c6b8a998115259',
        model: 'ICX7850-48FS',
        slots: [
          { slotNumber: 2, enable: true, option: '8X40/100G' },
          { slotNumber: 1, enable: true }
        ],
        trustPorts: ['1/1/3'],
        trustedPortType: 'all',
        vlanDemand: false
      }
    ],
    vlans: [
      {
        vlanId: 2,
        vlanName: 'test-vlan',
        ipv4DhcpSnooping: true,
        arpInspection: false,
        igmpSnooping: 'passive',
        multicastVersion: 3,
        spanningTreeProtocol: 'stp',
        switchFamilyModels: [
          {
            id: '5b902550c38343198059598a074c0e01',
            model: 'ICX7550-24P',
            slots: [
              { slotNumber: 2, enable: true, option: '2X40G' },
              { slotNumber: 1, enable: true },
              { slotNumber: 3, enable: true, option: '2X40G' }
            ],
            taggedPorts: '1/1/2',
            untaggedPorts: '1/1/22,1/1/24'
          }
        ],
        id: '0abd832af3e542f58341c85cf180ab2b'
      }
    ]
  }
]

export const venueExternalAntenna = [
  {
    enable24G: false,
    enable50G: false,
    model: 'E510'
  },
  {
    enable50G: true,
    gain50G: 8,
    model: 'T300E'
  },
  {
    enable24G: true,
    enable50G: true,
    gain24G: 9,
    gain50G: 9,
    model: 'T350SE'
  },
  {
    enable24G: true,
    enable50G: true,
    gain24G: 10,
    gain50G: 10,
    model: 'T750SE'
  }
]

export const venueExternalAntennaCap = {
  version: '6.2.0.103.500',
  apModels: [
    {
      externalAntenna: {
        enable24G: false,
        enable50G: false,
        gain24G: 3,
        gain50G: 3,
        supportDisable: true,
        coupled: false
      },
      model: 'E510',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: true,
          supportDisable: false,
          isPoePort: true,
          isPoeOutPort: false
        }
      ],
      allowDfsCountry: ['US', 'SG'],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: true,
      has160MHzChannelBandwidth: false,
      canSupportPoeOut: false,
      canSupportPoeMode: false,
      canSupportLacp: false,
      requireOneEnabledTrunkPort: true,
      lanPortPictureDownloadUrl:
        'https://lanPort_E510.jpg',
      pictureDownloadUrl:
        'https://E510.jpg',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 79,
      supportTriRadio: false,
      supportDual5gMode: false,
      supportChannel144: true,
      support11AX: false
    },
    {
      externalAntenna: {
        enable50G: false,
        gain50G: 5,
        supportDisable: true,
        coupled: false
      },
      model: 'T300E',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: true,
          supportDisable: false,
          isPoePort: true,
          isPoeOutPort: false
        }
      ],
      allowDfsCountry: ['US', 'SG'],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: true,
      has160MHzChannelBandwidth: false,
      canSupportPoeOut: false,
      canSupportPoeMode: false,
      canSupportLacp: false,
      requireOneEnabledTrunkPort: true,
      lanPortPictureDownloadUrl:
        'https://lanPort_T300.jpg',
      pictureDownloadUrl:
        'https://T300.png',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 32,
      supportTriRadio: false,
      supportDual5gMode: false,
      supportChannel144: true,
      support11AX: false
    },
    {
      externalAntenna: {
        enable24G: false,
        enable50G: false,
        gain24G: 8,
        gain50G: 8,
        supportDisable: true,
        coupled: true
      },
      model: 'T350SE',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: true,
          supportDisable: false,
          isPoePort: true,
          isPoeOutPort: false
        }
      ],
      allowDfsCountry: ['US', 'SG'],
      allowCbandCountry: ['GB'],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: true,
      has160MHzChannelBandwidth: false,
      canSupportPoeOut: false,
      canSupportPoeMode: true,
      canSupportLacp: false,
      requireOneEnabledTrunkPort: true,
      poeModeCapabilities: ['Auto', '802.3af', '802.3at'],
      lanPortPictureDownloadUrl:
        'https://lanPort_T350SE.png',
      pictureDownloadUrl:
        'https://T350SE.png',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 172,
      supportTriRadio: false,
      supportDual5gMode: false,
      supportChannel144: true,
      support11AX: true
    },
    {
      externalAntenna: {
        enable24G: false,
        enable50G: false,
        gain24G: 8,
        gain50G: 8,
        supportDisable: true,
        coupled: true
      },
      model: 'T750SE',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: false,
          supportDisable: true,
          isPoePort: false,
          isPoeOutPort: true
        },
        {
          id: '2',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: false,
          supportDisable: true,
          isPoePort: false,
          isPoeOutPort: false
        },
        {
          id: '3',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: false,
          supportDisable: false,
          isPoePort: true,
          isPoeOutPort: false
        }
      ],
      allowDfsCountry: ['US', 'SG'],
      allowCbandCountry: ['GB'],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: true,
      has160MHzChannelBandwidth: true,
      canSupportPoeOut: true,
      canSupportPoeMode: true,
      canSupportLacp: true,
      requireOneEnabledTrunkPort: true,
      poeModeCapabilities: [
        'Auto',
        '802.3at',
        '802.3bt-Class_5',
        '802.3bt-Class_6',
        '802.3bt-Class_7'
      ],
      lanPortPictureDownloadUrl:
        'https://lanPort_T750SE.png',
      pictureDownloadUrl:
        'https://T750SE.png',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 288,
      supportTriRadio: false,
      supportDual5gMode: false,
      supportChannel144: true,
      support11AX: true
    }
  ]
}

export const externalAntennaApModels = {
  E510: {
    enable24G: false,
    enable50G: false,
    model: 'E510',
    gain24G: 3,
    gain50G: 3,
    supportDisable: true
  },
  T300E: {
    enable50G: true,
    gain50G: 8,
    model: 'T300E',
    supportDisable: true
  },
  T350SE: {
    enable24G: true,
    enable50G: true,
    gain24G: 9,
    gain50G: 9,
    model: 'T350SE',
    supportDisable: true,
    coupled: true
  },
  T750SE: {
    enable24G: true,
    enable50G: true,
    gain24G: 10,
    gain50G: 10,
    model: 'T750SE',
    supportDisable: true,
    coupled: true
  }
} as unknown as {
  [index: string]: ExternalAntenna;
}

export const triBandApCap = {
  apModels: [
    { model: 'R560',
      allowCbandCountry: ['GB'],
      allowDfsCountry: ['US', 'SG'],
      canSupportCellular: false,
      canSupportLacp: true,
      canSupportPoeMode: true,
      canSupportPoeOut: false,
      capabilityScore: 288,
      has160MHzChannelBandwidth: true,
      isOutdoor: false,
      lanPortPictureDownloadUrl:
        'https://fakeLanportPic/wifi/firmware/6.2.0.99.1486/r560.jpg',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }, {
          id: '2',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'

        }
      ],
      ledOn: true,
      lldpAdInterval: 30,
      lldpEnable: true,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      maxChannelization5G: 80,
      maxChannelization6G: 160,
      maxChannelization24G: 40,
      pictureDownloadUrl:
        'https://fakeApPic/wifi/firmware/6.2.0.99.1486/r560.jpg',
      poeModeCapabilities: ['Auto', '802.3at', '802.3bt-Class_5'],
      requireOneEnabledTrunkPort: true,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      support11AX: true,
      support11BE: false,
      supportChannel144: true,
      supportDual5gMode: false,
      supportTriRadio: true,
      supportMesh: true,
      version: '6.2.1.103.2554'
    },
    { model: 'R760',
      allowCbandCountry: ['GB'],
      allowDfsCountry: ['US', 'SG'],
      canSupportCellular: false,
      canSupportLacp: true,
      canSupportPoeMode: true,
      canSupportPoeOut: false,
      capabilityScore: 288,
      has160MHzChannelBandwidth: true,
      isOutdoor: false,
      lanPortPictureDownloadUrl:
        'https://fakeLanPortPic/wifi/firmware/6.2.0.99.1486/r760.jpg',
      lanPorts: [
        {
          id: '1',
          defaultTyp: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }, {
          id: '2',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }
      ],
      ledOn: true,
      lldpAdInterval: 30,
      lldpEnable: true,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      maxChannelization5G: 160,
      maxChannelization6G: 160,
      maxChannelization24G: 40,
      pictureDownloadUrl:
        'https://fakeApPic/wifi/firmware/6.2.0.99.1486/r760.jpg',
      poeModeCapabilities: ['Auto', '802.3at', '802.3bt-Class_5'],
      requireOneEnabledTrunkPort: true,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      support11AX: true,
      supportChannel144: true,
      supportDual5gMode: true,
      supportTriRadio: true,
      supportMesh: true,
      version: '6.2.1.103.2554'
    }
  ],
  version: '7.2.0.0'
}

export const emptyList = {
  data: [],
  totalCount: 0
}

export const mockAaaSetting = {
  authnEnabledSsh: true,
  authnEnableTelnet: false,
  authnFirstPref: 'LOCAL',
  authzEnabledCommand: false,
  authzEnabledExec: false,
  acctEnabledCommand: false,
  acctEnabledExec: false,
  id: '3d0e71c087e743feaaf6f6a19ea955f2'
}

export const mockAaaSettingWithOrder = {
  id: 'aaa-setting-id',
  authnEnabledSsh: false,
  authnEnableTelnet: false,
  authzEnabledCommand: true,
  authzEnabledExec: true,
  acctEnabledCommand: true,
  acctEnabledExec: true,
  authzCommonsLevel: 'READ_ONLY',
  authzCommonsFirstServer: 'RADIUS',
  authzExecFirstServer: 'RADIUS',
  acctCommonsLevel: 'READ_WRITE',
  acctCommonsFirstServer: 'RADIUS',
  acctExecFirstServer: 'RADIUS'
}

export const mockDirectedMulticast = {
  wiredEnabled: true,
  wirelessEnabled: true,
  networkEnabled: true
}

export const mockRadiusOptions = {
  radiusOptions: {
    overrideEnabled: false,
    nasIdType: 'BSSID',
    nasRequestTimeoutSec: 3,
    nasMaxRetry: 2,
    nasReconnectPrimaryMin: 5,
    calledStationIdType: 'BSSID',
    nasIdDelimiter: 'DASH',
    userDefinedNasId: '',
    singleSessionIdAccounting: false
  }
}

export const mockCellularSettings = {
  model: 'M510',
  primarySim: {
    enabled: true,
    apn: 'defaultapn',
    roaming: true,
    networkSelection: 'AUTO'
  },
  secondarySim: {
    enabled: true,
    apn: 'defaultapn',
    roaming: true,
    networkSelection: 'AUTO'
  },
  wanConnection: 'ETH_WITH_CELLULAR_FAILOVER',
  primaryWanRecoveryTimer: 60
}

export const mockLoadBalabcing = {
  enabled: true,
  loadBalancingMethod: 'BASED_ON_CLIENT_COUNT',
  bandBalancingEnabled: true,
  bandBalancingClientPercent24G: 25,
  steeringMode: 'BASIC',
  stickyClientSteeringEnabled: true,
  stickyClientSnrThreshold: 15,
  stickyClientNbrApPercentageThreshold: 20
}

export const mockVenueClientAdmissionControl = {
  enable24G: true,
  enable50G: false,
  minClientCount24G: 10,
  minClientCount50G: 20,
  maxRadioLoad24G: 75,
  maxRadioLoad50G: 75,
  minClientThroughput24G: 0,
  minClientThroughput50G: 0
}

export const radiusList = {
  data: [
    {
      id: '40aa7da509ee48bb97e423d5f5d41ec0',
      name: 'r0',
      serverType: 'RADIUS',
      secret: 'dg',
      ip: '3.3.3.3',
      acctPort: 45,
      authPort: 45
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const tacacsList = {
  data: [
    {
      id: '4bd01f10e31a4d6c835d1785121bacd1',
      name: 't1',
      purpose: 'AUTHENTICATION_ONLY',
      serverType: 'TACACS_PLUS',
      secret: 'password-1',
      ip: '4.3.3.3',
      authPort: 56
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const localUserList = {
  data: [
    {
      id: '7829365a824e477d81332cfacfe29b95',
      name: 'admin',
      username: 'admin',
      password: '@cVp14FH_v',
      purpose: 'DEFAULT',
      level: 'READ_WRITE',
      serverType: 'LOCAL',
      authPort: 0,
      switchCountInVenue: 3,
      syncedPasswordSwitchCount: 2
    },
    {
      id: 'db611edec14e4536845e456fcd132fdb',
      level: 'READ_WRITE',
      password: 'Test123',
      serverType: 'LOCAL',
      switchCountInVenue: 3,
      username: 'test'
    },
    {
      id: '6c4aea92d32e4875a5b736db83875eb6',
      name: 'yguo1',
      username: 'yguo1',
      password: '12dC@jkfjk',
      level: 'READ_WRITE',
      serverType: 'LOCAL'
    }
  ],
  totalCount: 2,
  totalPages: 1,
  page: 1
}

export const defaultRadioCustomizationData = {
  radioParams6G: {
    method: 'CHANNELFLY',
    scanInterval: 10,
    allowedChannels: [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    channelBandwidth: 'AUTO',
    bssMinRate6G: 'HE_MCS_0',
    mgmtTxRate6G: '6',
    changeInterval: 33,
    txPower: 'MAX'
  },
  radioParamsDual5G: {
    enabled: true,
    inheritParamsLower5G: true,
    radioParamsLower5G: {
      allowedIndoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      allowedOutdoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    },
    inheritParamsUpper5G: true,
    radioParamsUpper5G: {
      allowedIndoorChannels: [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      allowedOutdoorChannels: [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    }
  },
  radioParams24G: {
    allowedChannels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    channelBandwidth: 'AUTO',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20,
    txPower: 'MAX'
  },
  radioParams50G: {
    combineChannels: false,
    allowedIndoorChannels: [
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '64',
      '100',
      '104',
      '108',
      '112',
      '116',
      '120',
      '124',
      '128',
      '132',
      '136',
      '140',
      '144',
      '149',
      '153',
      '157',
      '161'
    ],
    allowedOutdoorChannels: [
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '64',
      '100',
      '104',
      '108',
      '112',
      '116',
      '120',
      '124',
      '128',
      '132',
      '136',
      '140',
      '144',
      '149',
      '153',
      '157',
      '161'
    ],
    channelBandwidth: 'AUTO',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20,
    txPower: 'MAX'
  }
}

export const radioCustomizationData = {
  radioParams6G: {
    method: 'CHANNELFLY',
    scanInterval: 10,
    allowedChannels: [
      '1',
      '17',
      '33',
      '49',
      '65',
      '81',
      '97',
      '113',
      '129',
      '145',
      '161',
      '177',
      '193',
      '209'
    ],
    channelBandwidth: '80MHz',
    bssMinRate6G: 'HE_MCS_0',
    mgmtTxRate6G: '6',
    changeInterval: 33,
    txPower: 'MAX'
  },
  radioParamsDual5G: {
    enabled: true,
    inheritParamsLower5G: true,
    radioParamsLower5G: {
      allowedIndoorChannels: ['52', '56', '60', '64'],
      allowedOutdoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      channelBandwidth: '40MHz',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    },
    inheritParamsUpper5G: true,
    radioParamsUpper5G: {
      allowedIndoorChannels: [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      allowedOutdoorChannels: [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      channelBandwidth: '40MHz',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    }
  },
  radioParams24G: {
    allowedChannels: ['4', '5', '6', '7', '8', '9', '10', '11'],
    channelBandwidth: '40MHz',
    method: 'CHANNELFLY',
    changeInterval: 33,
    scanInterval: 20,
    txPower: 'MAX'
  },
  radioParams50G: {
    combineChannels: false,
    allowedIndoorChannels: [
      '52',
      '56',
      '60',
      '64',
      '100',
      '104',
      '108',
      '112',
      '116',
      '120',
      '124',
      '128',
      '132',
      '136',
      '140',
      '144',
      '149',
      '153',
      '157',
      '161'
    ],
    allowedOutdoorChannels: [
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '64',
      '100',
      '104',
      '108',
      '112',
      '116',
      '120',
      '124',
      '128',
      '132',
      '136',
      '140',
      '144'
    ],
    channelBandwidth: '160MHz',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20,
    txPower: 'Auto'
  }
}

export const validChannelsData = {
  '2.4GChannels': {
    'auto': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    '20MHz': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    '40MHz': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
  },
  '5GChannels': {
    indoor: {
      'auto': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '20MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161',
        '165'
      ],
      '40MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '80MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '160MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128'
      ]
    },
    outdoor: {
      'auto': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '20MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161',
        '165'
      ],
      '40MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '80MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '160MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128'
      ]
    },
    dfs: {
      'auto': [
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '20MHz': [
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '40MHz': [
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '80MHz': [
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '160MHz': [
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140'
      ]
    },
    indoorForOutdoorAp: {}
  },
  '5GLowerChannels': {
    indoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    outdoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    dfs: {
      'auto': ['52', '56', '60', '64'],
      '20MHz': ['52', '56', '60', '64'],
      '40MHz': ['52', '56', '60', '64'],
      '80MHz': ['52', '56', '60', '64'],
      '160MHz': ['52', '56', '60', '64']
    }
  },
  '5GUpperChannels': {
    indoor: {
      'auto': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '20MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161',
        '165'
      ],
      '40MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '80MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    outdoor: {
      'auto': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '20MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161',
        '165'
      ],
      '40MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '80MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    dfs: {
      'auto': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '20MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '40MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '80MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144'
      ],
      '160MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140'
      ]
    }
  },
  '6GChannels': {
    'auto': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    '40MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221',
      '225',
      '229'
    ],
    '80MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    '160MHz': [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ]
  }
}

const defaultPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

export const mockResidentPortalProfileList: NewTableResult<ResidentPortal> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'resident-portal-profile-id-1',
      name: 'resident-portal-profile-name-1'
    }
  ]
}

export const mockEnabledPinPropertyConfig: PropertyConfigs = {
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'persona-group-id-NSG',
  residentPortalId: mockResidentPortalProfileList.content[0].id,
  unitConfig: {
    type: 'unitConfig',
    guestAllowed: false,
    residentPortalAllowed: true,
    residentApiAllowed: false,
    useMaxUnitCount: false,
    maxUnitCount: 1
  }
}

export const mockEnabledNoPinPropertyConfig: PropertyConfigs = {
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'persona-group-id-noNSG',
  residentPortalId: mockResidentPortalProfileList.content[0].id,
  unitConfig: {
    type: 'unitConfig',
    guestAllowed: true,
    residentPortalAllowed: true,
    residentApiAllowed: false,
    useMaxUnitCount: false,
    maxUnitCount: 1
  }
}

// export const mockPropertyUnitList: NewTableResult<PropertyUnit> = {
//   pageable: propertyPageable,
//   sort: propertyPageable.sort,
//   totalElements: 1,
//   totalPages: 1,
//   content: [
//     {
//       id: 'unit-id-1',
//       name: 'unit-1',
//       status: PropertyUnitStatus.ENABLED,
//       dpsks: []
//     }
//   ]
// }

export const mockPersonaGroupWithoutPin: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  propertyId: 'propertyId-100'
}

export const mockPersonaGroupWithPin: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  personalIdentityNetworkId: 'nsg-id-1',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  propertyId: 'propertyId-100'
}

export const mockPropertyUnitList: NewTableResult<PropertyUnit> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'unit-id-1',
      name: 'unit-1',
      status: PropertyUnitStatus.ENABLED,
      dpsks: [],
      personaId: 'persona-1',
      identityCount: 2,
      vni: 0
    }, {
      id: 'unit-id-2',
      name: 'unit-2',
      status: PropertyUnitStatus.ENABLED,
      dpsks: [],
      personaId: 'persona-2',
      identityCount: 0,
      vni: 1
    }
  ]
}

export const mockPropertyUnit: PropertyUnit = {
  ...mockPropertyUnitList.content[0],
  personaId: 'unit-persona-id-1',
  guestPersonaId: 'guest-unit-persona-id-1'
}

export const venueSyslog = {
  serviceProfileId: '31846cfe930b49b4802b302f35029589',
  enabled: true
}

export const venueIot = {
  mqttBrokerAddress: '1234.ruckus.com',
  enabled: true
}

export const syslogServerProfiles = [{
  name: 'SyslogProfile1',
  id: '31846cfe930b49b4802b302f35029589',
  server: '1.1.1.1',
  port: 514,
  facility: 'KEEP_ORIGINAL' as FacilityEnum,
  priority: 'INFO' as PriorityEnum,
  protocol: 'UDP' as ProtocolEnum,
  flowLevel: 'CLIENT_FLOW' as FlowLevelEnum,
  secondaryServer: '2.2.2.2',
  secondaryPort: 514,
  secondaryProtocol: 'TCP' as ProtocolEnum,
  venueIds: [
    'bc20590f588948f1822dd20aa8a1914c'
  ]
},
{
  name: 'SyslogProfile2',
  id: '78f92fbf80334e8b83cddd3210db4920',
  server: '1.1.1.1',
  port: 514,
  facility: 'KEEP_ORIGINAL' as FacilityEnum,
  priority: 'INFO' as PriorityEnum,
  protocol: 'UDP' as ProtocolEnum,
  flowLevel: 'CLIENT_FLOW' as FlowLevelEnum,
  secondaryServer: '2.2.2.2',
  secondaryPort: 514,
  secondaryProtocol: 'TCP' as ProtocolEnum,
  venueIds: [
    'bc20590f588948f1822dd20aa8a1914c'
  ]
}]

export const resultOfGetVenueApSnmpAgentSettings = {
  apSnmpAgentProfileId: 'c1082e7d05d74eb897bb3600a15c1dc7',
  enableApSnmp: true
}

export const resultOfUpdateApSnmpAgentSettings = { requestId: '5aa421fd-25e9-4952-b3e0-a3a39c9a52bb' }

export const resultOfGetApSnmpAgentProfiles = [
  {
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'test',
        readPrivilege: true,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '10.206.78.28',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'testUser',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '00000000',
        privacyProtocol: 'AES',
        privacyPassword: '00000000'
      }
    ],
    policyName: 'SNMP-1',
    id: 'c1082e7d05d74eb897bb3600a15c1dc7'
  },
  {
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'test',
        readPrivilege: true,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '10.206.78.28',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'testUser',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '00000000',
        privacyProtocol: 'AES',
        privacyPassword: '00000000'
      }
    ],
    policyName: 'SNMP-2',
    id: 'l8oz9aez7mbyxgdkktvruibnqcw03hfs'
  }
]


const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

export const mockConnectionMeterings: ConnectionMetering[] = [{
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'profile1',
  uploadRate: 12,
  downloadRate: 5,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 1,
  unitCount: 2
}, {
  id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
  name: 'profile2',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_MONTHLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'afce7414-1c78-4312-ad5b-ae03f28dbc6c',
  name: 'profile3',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_WEEKLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'bfde7414-1c78-4312-ad5b-ae03f18dbc68',
  name: 'profile4',
  uploadRate: 10,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_NUMS_DAY' as BillingCycleType,
  billingCycleDays: 6,
  venueCount: 1,
  unitCount: 1
}
]


export const mockConnectionMeteringTableResult : NewTableResult<ConnectionMetering> = {
  content: mockConnectionMeterings,
  pageable: defaultPageable,
  totalPages: 1,
  totalElements: 4,
  sort: defaultPageable.sort
}

export const mockedTemplateScope: TemplateScope = {
  id: '648269aa-23c7-41da-baa4-811e92d89ed1',
  messageType: MessageType.EMAIL,
  nameLocalizationKey: 'unit.assigned.email',
  defaultTemplateId: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9'
}

export const mockDpskList = {
  content: [
    {
      id: 'dpsk-pool-1',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expirationType: null
    },
    {
      id: '123456789b',
      name: 'DPSK Service 2',
      passphraseLength: 22,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationDate: '2022-12-07'
    },
    {
      id: '123456789c',
      name: 'DPSK Service 3',
      passphraseLength: 24,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationOffset: 2
    }
  ],
  totalElements: 3,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

export const mockMacRegistrationList: NewTableResult<MacRegistrationPool> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [{
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    enabled: true,
    expirationEnabled: true,
    policySetId: 'string',
    expirationOffset: 1,
    expirationDate: 'string',
    defaultAccess: 'string',
    registrationCount: 0
  }]
}

export const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}

export const mockPersonaList: NewTableResult<Persona> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'persona-id-1',
      name: 'persona-name-1',
      email: 'persona1@mail.com',
      groupId: 'persona-group-id-1',
      dpskGuid: 'dpsk-guid-1',
      dpskPassphrase: 'dpsk-passphrase-1',
      deviceCount: 12,
      revoked: false,
      ethernetPorts: [{
        portIndex: 1,
        personaId: 'persona-id-1',
        macAddress: 'ap-mac-address-1'
      }]
    },
    {
      id: 'persona-id-2',
      name: 'persona-name-2',
      groupId: 'persona-group-id-1',
      email: 'persona2@mail.com',
      dpskGuid: 'dpsk-guid-2',
      dpskPassphrase: 'dpsk-passphrase-2',
      revoked: true,
      ethernetPorts: [{
        portIndex: 1,
        personaId: 'persona-id-2',
        macAddress: 'ap-mac-address-2'
      }]
    }
  ]
}

export const mockedUnitLinkedIdentity = {
  unitId: '069c06765c9841fcaf35bb5dbd2319eb',
  personaType: 'Linked',
  personaId: 'persona-id-1',
  requestId: 'request-id-1'
}

export const mockVenueConfigTemplates = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '069c06765c9841fcaf35bb5dbd2319eb',
      name: 'My1stVenueTemplate1'
    },
    {
      id: 'eb9555414ea444aa984d5399f0c1c892',
      name: 'My1stVenueTemplate2'
    }
  ]
}

export const mockRogueApPoliciesListRbac = {
  fields: [
    'numOfRules',
    'venueCount',
    'name',
    'description',
    'rule',
    'rules',
    'id',
    'venueIds'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '6015cbb1000f419bb08a04bc6c8fe70c',
      name: 'a123',
      description: '',
      numOfRules: 1,
      venueIds: [
        'b51e7420c87b49cba652ac980476a489',
        '8f0ec2f60f6a4a4d8457b1dacbac9e4f'
      ]
    }
  ]
}

export const mockedRogueApPolicyRbac = {
  name: 'a123',
  rules: [
    {
      name: '123123',
      type: 'AdhocRule',
      classification: 'Malicious',
      priority: 1
    }
  ],
  id: '6015cbb1000f419bb08a04bc6c8fe70c'
}

export const mockedRebootTimeout = {
  gatewayLossTimeout: 7200,
  serverLossTimeout: 7200
}

export const mockSoftGreTable = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '0d89c0f5596c4689900fb7f5f53a0859',
      name: 'softGreProfileName1',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.1',
      secondaryGatewayAddress: '128.0.0.0',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_1', 'network_2', 'd556bb683e4248b7a911fdb40c307aa5']
        }
      ]
    },
    {
      id: '75aa5131892d44a6a85a623dd3e524ed',
      name: 'softGreProfileName2',
      mtuType: MtuTypeEnum.AUTO,
      disassociateClientEnabled: true,
      primaryGatewayAddress: '128.0.0.3',
      keepAliveInterval: 10,
      keepAliveRetryTimes: 5,
      activations: [
        {
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_4', 'network_5']
        }
      ]
    },
    {
      id: 'softGreProfileName3-id',
      name: 'softGreProfileName3',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.4',
      secondaryGatewayAddress: '128.0.0.5',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: 'venueId-1',
          wifiNetworkIds: ['network_6']
        }
      ]
    },
    {
      id: 'softGreProfileName4-id',
      name: 'softGreProfileName4',
      mtuType: MtuTypeEnum.MANUAL,
      mtuSize: 1450,
      disassociateClientEnabled: false,
      primaryGatewayAddress: '128.0.0.4',
      secondaryGatewayAddress: '128.0.0.5',
      keepAliveInterval: 100,
      keepAliveRetryTimes: 8,
      activations: [
        {
          venueId: 'venueId-2',
          wifiNetworkIds: ['network_6']
        }
      ]
    }
  ] as SoftGreViewData[]
}

export const mockedClientIsolationProfileId1 = '__ClientIsolationProfileId1__'
export const mockedClientIsolationProfileId2 = '__ClientIsolationProfileId2__'
export const mockedClientIsolationProfileName1 = 'clientIsolation1'
export const mockedClientIsolationProfileName2 = 'clientIsolation2'
export const mockedClientIsolation2 = {
  id: mockedClientIsolationProfileId2,
  name: mockedClientIsolationProfileName2,
  description: 'Hello Client',
  allowlist: [
    {
      mac: 'AA:BB:CC:DD:EE:11',
      description: 'Client A'
    },
    {
      mac: 'AA:BB:CC:DD:EE:22',
      description: 'Client B'
    },
    {
      mac: 'AA:BB:CC:DD:EE:33',
      description: 'Client C'
    }
  ]
}


export const mockedClientIsolationQueryData = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      id: mockedClientIsolationProfileId1,
      name: mockedClientIsolationProfileName1,
      description: '',
      clientEntries: [
        'aa:21:92:3e:33:e0',
        'e6:e2:fd:af:54:49'
      ],
      activations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          wifiNetworkId: 'bd789b85931b40fe94d15028dffc6214'
        },
        {
          venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4',
          wifiNetworkId: '936ad54680ba4e5bae59ae1eb817ca24'
        }
      ],
      venueActivations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          apModel: 'R610',
          apSerialNumbers: ['121749001049'],
          portId: 1
        },
        {
          venueId: mockedVenueId,
          apModel: 'T750',
          apSerialNumbers: ['121749001051'],
          portId: 1
        }
      ],
      apActivations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          apModel: 'R510',
          apSerialNumber: '121749001050',
          portId: 2
        }
      ]
    },
    {
      id: mockedClientIsolationProfileId2,
      name: mockedClientIsolationProfileName2,
      description: '',
      clientEntries: [
        'AA:BB:CC:DD:EE:11',
        'AA:BB:CC:DD:EE:22',
        'AA:BB:CC:DD:EE:33'
      ]
    }
  ]
}

export const mockedVenueLanPortSettings1 = {
  clientIsolationEnabled: true,
  clientIsolationSettings: {
    packetsType: IsolatePacketsTypeEnum.UNICAST,
    autoVrrp: false
  },
  enabled: true
}

export const mockedVenueLanPortSettings2 = {
  enabled: true
}

export const mockedVenueLanPortSettings3 = {
  enabled: true
}
