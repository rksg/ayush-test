
import {
  GuestNetworkTypeEnum,
  SocialIdentitySource,
  TimeUnitEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  WlanSecurityEnum,
  AuthRadiusEnum,
  RadioEnum,
  RadioTypeEnum,
  SchedulerTypeEnum,
  Hotspot20AccessNetworkTypeEnum,
  Hotspot20Ipv4AddressTypeEnum,
  NetworkHotspot20Settings,
  SmsProviderType,
  SoftGreViewData,
  MtuTypeEnum
} from '@acx-ui/rc/utils'

export const networksResponse = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: []
}
export const networkDeepResponse = {
  type: 'psk',
  wlan: {
    advancedCustomization: {
      clientIsolation: true,
      userUplinkRateLimiting: 0,
      userDownlinkRateLimiting: 0,
      totalUplinkRateLimiting: 0,
      totalDownlinkRateLimiting: 0,
      maxClientsOnWlanPerRadio: 100,
      enableBandBalancing: true,
      clientIsolationOptions: {
        packetsType: 'UNICAST',
        autoVrrp: false
      },
      hideSsid: false,
      forceMobileDeviceDhcp: false,
      clientLoadBalancingEnable: true,
      directedThreshold: 5,
      enableNeighborReport: true,
      radioCustomization: {
        rfBandUsage: 'BOTH',
        bssMinimumPhyRate: 'default',
        phyTypeConstraint: 'OFDM',
        managementFrameMinimumPhyRate: '6'
      },
      enableSyslog: false,
      clientInactivityTimeout: 120,
      accessControlEnable: false,
      respectiveAccessControl: true,
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
      dnsProxyEnabled: false
    },
    vlanId: 1,
    ssid: '',
    enabled: true
  },
  tenantId: '3394d65f20114028996f8301bbde622f',
  name: '',
  id: '3dc530b525654be1bee143728ba39f8a',

  venues: [
    {
      venueId: '2658c3431412441197ec33aaa64c5147',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      apGroups: [
        {
          apGroupId: '51aa645a5d4840ea837ac98fc2b91ef0',
          vlanId: 1,
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '654d75c875eb4c29ad6456a866d81b62'
        }
      ],
      allApGroupsRadio: '5-GHz',
      allApGroupsRadioTypes: ['5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        tue: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111'
      },
      isAllApGroups: false,
      id: 'bdc3edc58764467996b709403ec77a24'
    },
    {
      venueId: '3826fc9ad0e64471a1b9901c3980c169',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '111111111100011111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        tue: '111111111100011111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111100011111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111100011111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
      },
      isAllApGroups: true,
      id: '43ea24d0356f4dcbbfcb4933653f70a6'
    },
    {
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      apGroups: [
        {
          apGroupId: 'c3b59e5f488c4d85b5044939f6a9449b',
          vlanId: 1,
          radio: 'Both',
          radioTypes: ['5-GHz', '2.4-GHz'],
          isDefault: false,
          apGroupName: 'eee',
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: 'dc4358301fa54d95ad426d2c42f3f344'
        }
      ],
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      isAllApGroups: false,
      id: '007ca76902784d21a63aef7c623f2e43'
    },
    {
      venueId: '74f058ee8ea141a0b09a89c022a04a10',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        mon: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        tue: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111100000000000000000000000000000000000000000000000000'
      },
      isAllApGroups: true,
      id: '2d88d0321de4436cae886ac72a4df5d7'
    },
    {
      venueId: '908c47ee1cd445838c3bf71d4addccdf',
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        mon: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        tue: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111111111111111111111100000000000000000000000000000000'
      },
      isAllApGroups: true,
      id: 'a5cbc73da9c14a1eb980e01f0a6035ca'
    },
    {
      venueId: 'a4f9622e9c7547ba934fbb5ee55646c2',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      apGroups: [
        {
          apGroupId: '4a027ae858dd440baeef6f3245dcb94b',
          vlanId: 1,
          radio: 'Both',
          radioTypes: ['5-GHz', '2.4-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '417dec1578624431a5c3b0f5528b69d0'
        }
      ],
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111',
        // eslint-disable-next-line max-len
        tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111111111111111111111111111111111100001111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111111111111111111111111111111111100001111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111100001111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111100001111111111111111111111111111111111111111111111111111'
      },
      isAllApGroups: false,
      id: '5749e62574e34298ba99d39ad7747d0d'
    },
    {
      venueId: 'cd0eca75dabc46f1a7c0921d2b44e647',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      isAllApGroups: true,
      id: '2bd92accb3e8449d84be7d961b0d6dd0'
    },
    {
      venueId: 'f27f33e0475d4f49af57350fed788c7b',
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      apGroups: [
        {
          apGroupId: '270a40a7da33456ea8b866788b28379a',
          vlanId: 1,
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '97e5c17eff014a57a25f9f3c3abae054'
        }
      ],
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      scheduler: {
        type: 'CUSTOM',
        // eslint-disable-next-line max-len
        sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        mon: '111111111111111000000000011111111111111111111111111111111111111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        tue: '111111111111111000000000011111111111111111111111111111100000111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        wed: '111111111111111000000000011111111111111111111111111111100000111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        thu: '111111111111111000000000011111111111111111111111111111100000111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        fri: '111111111111111111111111111111111111111111111111111111100000111111111111111111111111111111111111',
        // eslint-disable-next-line max-len
        sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
      },
      isAllApGroups: false,
      id: 'e2cc096d71954b47b19f822a4a53ad84'
    }
  ]
}

export const venuesResponse = {
  fields: [
    'country',
    'city',
    'aps',
    'latitude',
    'switches',
    'description',
    'networks',
    'switchClients',
    'vlan',
    'radios',
    'name',
    'scheduling',
    'id',
    'aggregatedApStatus',
    'mesh',
    'activated',
    'longitude',
    'status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7690084',
      longitude: '-73.9431541',
      switches: 2,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      networks: {
        count: 4,
        names: ['002', '003', 'open network test', '001'],
        vlans: [1]
      }
    },
    {
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',
      name: 'TDC_Venue',
      description: 'Taipei',
      city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',
      latitude: '25.0346703',
      longitude: '121.5218293',
      networks: { count: 1, names: ['JK-Network'], vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,
      switches: 1,
      status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

export const venueListResponse = {
  fields: [
    'country',
    'city',
    'aps',
    'latitude',
    'switches',
    'description',
    'networks',
    'switchClients',
    'vlan',
    'radios',
    'name',
    'scheduling',
    'id',
    'aggregatedApStatus',
    'mesh',
    'activated',
    'longitude',
    'status'
  ],
  totalCount: 10,
  page: 1,
  data: [
    {
      id: '908c47ee1cd445838c3bf71d4addccdf',
      name: 'DEMO_VENUE test 5',
      description: '',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: {
        count: 4,
        names: ['002', 'open network test', '003', '001'],
        vlans: [1]
      },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: 'cd0eca75dabc46f1a7c0921d2b44e647',
      name: 'license test',
      description: '',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: { count: 2, names: ['001 - copy', '001'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '4c778ed630394b76b17bce7fe230cf9f',
      name: 'My-Venue',
      description: 'My-Venuefdf',
      city: 'New York',
      country: 'United States',
      latitude: '40.7690084',
      longitude: '-73.9431541',
      networks: {
        count: 11,
        names: [
          'NMS-app6-WLAN',
          'aaa-45',
          'su-psk',
          'dfg',
          '002',
          'NMS-app6-JK-acx-hybrid',
          'su-dpsk',
          'su-open',
          'guest pass wlan',
          'dddd',
          '001'
        ],
        vlans: [1]
      },
      aggregatedApStatus: {
        '1_09_Offline': 1,
        '3_04_DisconnectedFromCloud': 1,
        '1_01_NeverContactedCloud': 2
      },
      status: '3_RequiresAttention',
      mesh: { enabled: false }
    },
    {
      id: '3826fc9ad0e64471a1b9901c3980c169',
      name: 'NEW',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: { count: 3, names: ['002', 'NEW', '001'], vlans: [1] },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: 'f27f33e0475d4f49af57350fed788c7b',
      name: 'SG office',
      description: 'SG office',
      city: 'Singapore',
      country: 'Singapore',
      latitude: '1.3010685',
      longitude: '103.8626788',
      networks: { count: 2, names: ['002', '001'], vlans: [1] },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '74f058ee8ea141a0b09a89c022a04a10',
      name: 'TEST for ap group',
      city: 'Tampa, Florida',
      country: 'United States',
      latitude: '27.950575',
      longitude: '-82.4571776',
      networks: { count: 1, names: ['001'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 2 },
      switches: 2,
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '2658c3431412441197ec33aaa64c5147',
      name: 'UI team with AP',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: { count: 1, names: ['001'], vlans: [1] },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: 'a4f9622e9c7547ba934fbb5ee55646c2',
      name: 'venue-dhcp',
      description: '',
      city: 'Taiping, Perak',
      country: 'Malaysia',
      latitude: '4.854995099999999',
      longitude: '100.751032',
      networks: { count: 1, names: ['001'], vlans: [1] },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '16b11938ee934928a796534e2ee47661',
      name: 'venue-dhcp-ui',
      description: '',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: { count: 1, names: ['001 - copy'], vlans: [] },
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    },
    {
      id: '0908ef7cf76441f18c26734cc80e984a',
      name: 'venue2',
      description: '',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: { count: 1, names: ['001 - copy'], vlans: [] },
      switches: 2,
      status: '1_InSetupPhase',
      mesh: { enabled: false }
    }
  ]
}

export const successResponse = {
  requestId: 'request-id',
  response: {
    id: 'new-network-id'
  }
}

export const policyListResponse = {
  data: [],
  fields: ['name', 'id'],
  totalCount: 0,
  totalPages: 0,
  page: 1
}

export const devicePolicyListResponse = {
  data: [
    {
      id: '361a8e49222a4cbeae2bc6c7f0127dca',
      name: 'device1',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}
export const devicePolicyDetailResponse = {
  id: '361a8e49222a4cbeae2bc6c7f0127dca',
  name: 'device1',
  rulesCount: 1,
  networksCount: 0
}

export const applicationPolicyListResponse = {
  data: [
    {
      id: 'e1ba3e5ca73b4bbf8c53bb5feff31f9b',
      name: 'application1',
      rulesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const layer2PolicyListResponse = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'dee8918e1c40474a9f779b39ee672c5b',
      name: 'layer2policy1',
      networkCount: 0
    }
  ]
}

export const layer3PolicyListResponse = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '4dee545ff0e04100b13774aa0ba6fc57',
      name: 'layer3policy1',
      networkCount: 0
    }
  ]
}

export const accessControlListResponse = {
  fields: [
    'clientRateUpLinkLimit',
    'l3AclPolicyId',
    'applicationPolicyName',
    'clientRateDownLinkLimit',
    'networkCount',
    'devicePolicyName',
    'l2AclPolicyId',
    'networkIds',
    'name',
    'applicationPolicyId',
    'id',
    'l3AclPolicyName',
    'l2AclPolicyName',
    'devicePolicyId'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '2918e310075a4f5bb1b0d161769f6f64',
      name: 'acl-1',
      l2AclPolicyName: 'layer2policy1',
      l2AclPolicyId: 'dee8918e1c40474a9f779b39ee672c5b',
      l3AclPolicyName: 'layer3policy1',
      l3AclPolicyId: '4dee545ff0e04100b13774aa0ba6fc57',
      devicePolicyName: '',
      devicePolicyId: '',
      applicationPolicyName: '',
      applicationPolicyId: '',
      clientRateUpLinkLimit: 0,
      clientRateDownLinkLimit: 0,
      networkIds: [
        '7f52e203c2d9402896df8075a17dbcf8'
      ],
      networkCount: 1
    }
  ]
}

export const dhcpResponse = {
  id: '6cf550cdb67641d798d804793aaa82db',
  name: 'My-DHCP',
  vlanId: 0,
  subnetAddress: '2.2.2.3',
  subnetMask: '255.255.255.0',
  startIpAddress: '10.2.2.2',
  endIpAddress: '10.2.2.20',
  primaryDnsIp: '10.1.1.1',
  secondaryDnsIp: '10.2.3.3',
  leaseTimeHours: 2,
  leaseTimeMinutes: 2
}
export const hostapprovalData = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    guestNetworkType: GuestNetworkTypeEnum.HostApproval,
    hostGuestConfig: {
      hostDomains: ['aa.com'],
      hostDurationChoices: [1, 4, 24, 168, 730]
    }
  }
} as NetworkSaveData

export const cloudPathDataNone = {
  authRadiusPolicyProfileId: '55843a3c84ae47d5bb077236917a448a',
  accountingRadiusPolicyProfileId: '55843a3c84ae47d5bb077236917a448cd',
  enableAccountingProxy: true,
  enableAuthProxy: true,
  accountingRadius: {
    name: 'acc1',
    id: '22',
    type: 'ACCOUNTING',
    primary: {
      sharedSecret: 'xxxxxxxxx'
    }
  },
  authRadius: {
    name: 'auth1',
    id: '21',
    type: 'AUTHENTICATION'
  },
  guestPortal: {
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.Cloudpath,
    externalPortalUrl: 'http://aa.bb'
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.None,
    bypassCNA: false
  }
}

export const mockedCloudPathAuthRadius = {
  id: '21',
  name: 'auth1',
  primary: {
    ip: '123.123.123.1',
    port: 1187,
    sharedSecret: '12345678'
  },
  type: 'AUTHENTICATION'
}

export const mockedCloudPathAcctRadius = {
  id: '22',
  name: 'auth1',
  primary: {
    ip: '12.12.12.1',
    port: 1187,
    sharedSecret: '12345678'
  },
  type: 'ACCOUNTING'
}

export const wisprDataNone = {
  guestPortal: {
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'WifiSocial'
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.None
  }
}
export const wisprDataWep = {
  guestPortal: {
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'WifiSocial'
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.WEP,
    wepHexKey: 'aaaaaaaaaa'
  }
}
export const wisprDataWPA23 = {
  guestPortal: {
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'WifiSocial'
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.WPA23Mixed,
    passphrase: 'aaaaaaaaaa',
    saePassphrase: 'bbbbbbbbb'
  }
}
export const wisprDataWPA2 = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'Select provider',
      authRadius: { secondary: {} },
      accountingRadius: { secondary: {} }
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.WPA2Personal,
    passphrase: 'aaaaaaaaaa'
  }
}
export const wisprDataForAllAccept = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'Select provider',
      authRadius: { secondary: {} },
      accountingRadius: { secondary: {} },
      authType: AuthRadiusEnum.ALWAYS_ACCEPT
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: false,
    wlanSecurity: WlanSecurityEnum.WPA2Personal,
    passphrase: 'aaaaaaaaaa'
  }
}
export const wisprDataForOnlyAuth = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    walledGardens: ['aa.com'],
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'Select provider',
      authRadius: { secondary: {} },
      accountingRadius: { secondary: {} },
      authType: AuthRadiusEnum.RADIUS
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: false,
    wlanSecurity: WlanSecurityEnum.WPA2Personal,
    passphrase: 'aaaaaaaaaa'
  }
}
export const selfsignData = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    guestNetworkType: GuestNetworkTypeEnum.SelfSignIn,
    enableSmsLogin: true,
    socialIdentities: {
      facebook: { source: SocialIdentitySource.CUSTOM },
      google: { source: SocialIdentitySource.CUSTOM },
      twitter: { source: SocialIdentitySource.CUSTOM },
      linkedin: { source: SocialIdentitySource.CUSTOM }
    },
    socialEmails: true,
    socialDomains: ['http://123.com'],
    smsPasswordDuration: {
      duration: 12,
      unit: TimeUnitEnum.HOUR
    }
  }
}
export const guestpassData = {
  enableDhcp: true,
  guestPortal: {
    redirectUrl: 'dbaidu.com'
  }
}
export const portalList = [
  {
    id: '2',
    serviceName: 'test2',
    content: {
      welcomeText: 'Welcome to the Guest Access login page',
      welcomeColor: '#333333',
      bgImage: '',
      bgColor: '#FFFFFF',
      welcomeSize: 14,

      photoRatio: 170,

      logoRatio: 105,
      secondaryText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing' +
        ' elit. Aenean euismod bibendum laoreet.',
      secondaryColor: '#333333',
      secondarySize: 14,
      buttonColor: '#EC7100',
      poweredBgColor: '#FFFFFF',
      poweredColor: '#333333',
      poweredSize: 14,
      poweredImgRatio: 50,
      poweredImg: '',
      wifi4EUNetworkId: '',
      termsCondition: '',
      componentDisplay: {
        logo: true,
        welcome: true,
        photo: true,
        secondaryText: true,
        termsConditions: false,
        poweredBy: true,
        wifi4eu: false
      },
      displayLangCode: 'en',

      alternativeLang: { cs: false, zh_TW: false, fr: false }
    }
  }
]
export const portalListWithPhoto = [
  {
    id: '2',
    serviceName: 'test2',
    content: {
      welcomeText: 'Welcome to the Guest Access login page',
      welcomeColor: '#333333',
      bgColor: '#FFFFFF',
      welcomeSize: 14,
      poweredImg: 'test',
      logo: 'test',
      photo: 'test',
      bgImage: 'test',
      photoRatio: 170,

      logoRatio: 105,
      secondaryText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing' +
        ' elit. Aenean euismod bibendum laoreet.',
      secondaryColor: '#333333',
      secondarySize: 14,
      buttonColor: '#EC7100',
      poweredBgColor: '#FFFFFF',
      poweredColor: '#333333',
      poweredSize: 14,
      poweredImgRatio: 50,
      wifi4EUNetworkId: '',
      termsCondition: '',
      componentDisplay: {
        logo: true,
        welcome: true,
        photo: true,
        secondaryText: true,
        termsConditions: false,
        poweredBy: true,
        wifi4eu: false
      },
      displayLangCode: 'en',

      alternativeLang: { cs: false, zh_TW: false, fr: false }
    }
  }
]

export const portalTemaplteResponse = {
  id: '1',
  name: 'test111',
  content: {
    bgColor: 'var(--acx-primary-white)',
    bgImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: 16,
    photo: '',
    photoRatio: 170,
    logo: '',
    logoRatio: 105,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
      'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: 12,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBgColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: 14,
    poweredImg: '',
    poweredImgRatio: 50,
    termsCondition: '',
    componentDisplay: {
      logo: true,
      welcome: true,
      photo: true,
      secondaryText: true,
      termsConditions: false,
      poweredBy: true,
      wifi4eu: false
    } ,
    displayLangCode: 'en',
    wifi4EUNetworkId: '',
    alternativeLang: {
      cs: false,
      zh_TW: false,
      fi: false,
      fr: false,
      de: false,
      el: false,
      hu: false,
      it: false
    }
  }
}

export const externalProviders = {
  providers: [
    {
      regions: [
        {
          name: 'Global',
          authRadius: {
            primary: {
              ip: '158.106.110.94',
              port: 1812
            },
            secondary: {
              ip: '206.25.74.94',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '158.106.110.94',
              port: 1813
            },
            secondary: {
              ip: '206.25.74.94',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Middle East',
          authRadius: {
            primary: {
              ip: '150.129.118.29',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '150.129.118.29',
              port: 1813
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'Aislelabs',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Global',
          captivePortalUrl: 'http://333.cc.com',
          redirectUrl: 'baibai.com.cn',
          authRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          accountingRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'SkyWifiRadSec',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Global',
          authRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          accountingRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'SkyWifiRadSecTest',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Australia & New Zealand',
          authRadius: {
            primary: {
              ip: '52.64.33.144',
              port: 1812
            },
            secondary: {
              ip: '52.62.73.96',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.64.33.144',
              port: 1813
            },
            secondary: {
              ip: '52.62.73.96',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Asia',
          authRadius: {
            primary: {
              ip: '52.74.81.42',
              port: 1812
            },
            secondary: {
              ip: '52.220.47.94',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.74.81.42',
              port: 1813
            },
            secondary: {
              ip: '52.220.47.94',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Europe',
          authRadius: {
            primary: {
              ip: '52.18.184.156',
              port: 1812
            },
            secondary: {
              ip: '52.50.161.230',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.18.184.156',
              port: 1813
            },
            secondary: {
              ip: '52.50.161.230',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'North America',
          authRadius: {
            primary: {
              ip: '52.52.68.90',
              port: 1812
            },
            secondary: {
              ip: '52.8.61.119',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.52.68.90',
              port: 1813
            },
            secondary: {
              ip: '52.8.61.119',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'South America',
          authRadius: {
            primary: {
              ip: '54.94.181.249',
              port: 1812
            },
            secondary: {
              ip: '52.67.103.30',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '54.94.181.249',
              port: 1813
            },
            secondary: {
              ip: '52.67.103.30',
              port: 1813
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'Skyfii',
      customExternalProvider: false
    }
  ]
}

export const externalWifiProviders = {
  wisprProviders: [
    {
      regions: [
        {
          name: 'Global',
          authRadius: {
            primary: {
              ip: '158.106.110.94',
              port: 1812
            },
            secondary: {
              ip: '206.25.74.94',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '158.106.110.94',
              port: 1813
            },
            secondary: {
              ip: '206.25.74.94',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Middle East',
          authRadius: {
            primary: {
              ip: '150.129.118.29',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '150.129.118.29',
              port: 1813
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'Aislelabs',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Global',
          captivePortalUrl: 'http://333.cc.com',
          redirectUrl: 'baibai.com.cn',
          authRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          accountingRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'SkyWifiRadSec',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Global',
          authRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          accountingRadius: {
            primary: {
              ip: '81.150.39.238',
              port: 2083
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'SkyWifiRadSecTest',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Australia & New Zealand',
          authRadius: {
            primary: {
              ip: '52.64.33.144',
              port: 1812
            },
            secondary: {
              ip: '52.62.73.96',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.64.33.144',
              port: 1813
            },
            secondary: {
              ip: '52.62.73.96',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Asia',
          authRadius: {
            primary: {
              ip: '52.74.81.42',
              port: 1812
            },
            secondary: {
              ip: '52.220.47.94',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.74.81.42',
              port: 1813
            },
            secondary: {
              ip: '52.220.47.94',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'Europe',
          authRadius: {
            primary: {
              ip: '52.18.184.156',
              port: 1812
            },
            secondary: {
              ip: '52.50.161.230',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.18.184.156',
              port: 1813
            },
            secondary: {
              ip: '52.50.161.230',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'North America',
          authRadius: {
            primary: {
              ip: '52.52.68.90',
              port: 1812
            },
            secondary: {
              ip: '52.8.61.119',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '52.52.68.90',
              port: 1813
            },
            secondary: {
              ip: '52.8.61.119',
              port: 1813
            }
          },
          showAnalyticsData: false
        },
        {
          name: 'South America',
          authRadius: {
            primary: {
              ip: '54.94.181.249',
              port: 1812
            },
            secondary: {
              ip: '52.67.103.30',
              port: 1812
            }
          },
          accountingRadius: {
            primary: {
              ip: '54.94.181.249',
              port: 1813
            },
            secondary: {
              ip: '52.67.103.30',
              port: 1813
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'Skyfii',
      customExternalProvider: false
    },
    {
      regions: [
        {
          name: 'Test-Region-5',
          authRadius: {
            primary: {
              ip: '34.72.60.108',
              port: '3812'
            },
            secondary: {
              ip: '2.2.2.2',
              port: '3002'
            }
          },
          accountingRadius: {
            primary: {
              ip: '34.72.60.108',
              port: '3813'
            },
            secondary: {
              ip: '4.4.4.4',
              port: '3004'
            }
          },
          showAnalyticsData: false
        }
      ],
      name: 'Test-Provider-0502',
      customExternalProvider: false
    }
  ]
}
export const dpskListResponse = {
  content: [
    {
      id: '123456789a',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: 'MOST_SECURED',
      expirationType: null
    },
    {
      id: '123456789b',
      name: 'DPSK Service 2',
      passphraseLength: 22,
      passphraseFormat: 'KEYBOARD_FRIENDLY',
      expirationType: 'SPECIFIED_DATE',
      expirationDate: '2022-12-07'
    },
    {
      id: '123456789c',
      name: 'DPSK Service 3',
      passphraseLength: 24,
      passphraseFormat: 'KEYBOARD_FRIENDLY',
      expirationType: 'HOURS_AFTER_TIME',
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

export const partialDpskNetworkEntity: NetworkSaveData = {
  type: NetworkTypeEnum.DPSK,
  wlan: {
    wlanSecurity: WlanSecurityEnum.WPA2Personal,
    vlanId: 1,
    ssid: 'JackyDPSK'
  },
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  dpskServiceProfileId: dpskListResponse.content[1].id,
  name: 'JackyDPSK',
  id: '1887fef21cdf485cbe2583b8c5ec97f1'
}

export const networkAPGroupResponse = {
  requestId: '7dd85164-a1b5-493a-8def-a5214ca01960',
  response: [
    {
      venueId: '908c47ee1cd445838c3bf71d4addccdf',
      tripleBandEnabled: false,
      networkId: '573c1d9efc5e4d9eada3f9b8be199186',
      apGroups: [
        {
          apGroupId: '068a4db6f47d418ebbbdbca741253735',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: false,
          apGroupName: 'hhh',
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: 'b123e0174c57455aac2b5d1d88dec7bd'
        },
        {
          apGroupId: '3243f76d6cb04fa7ab18d0e6d17b6f18',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '338e9bbe113a46059d5446eebad5963f'
        }
      ],
      allApGroupsRadio: 'Both',
      isAllApGroups: false
    }
  ]
}

export const apGroupsResponse = {
  requestId: '04a97b0b-c3ff-4184-812c-3267029e3f08',
  response: [
    {
      venueId: '908c47ee1cd445838c3bf71d4addccdf',
      tripleBandEnabled: false,
      networkId: '5d45082c812c45fbb9aab24420f39bf0',
      apGroups: [
        {
          apGroupId: '3243f76d6cb04fa7ab18d0e6d17b6f18',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: 'b5275fde5b5f4a119665cd3a8bde30e5'
        },
        {
          apGroupId: '068a4db6f47d418ebbbdbca741253735',
          radio: 'Both',
          radioTypes: ['2.4-GHz', '5-GHz'],
          isDefault: false,
          apGroupName: 'hhh',
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false,
          id: '5aee44348f174c94aeec545e8e7162fb'
        }
      ],
      allApGroupsRadio: 'Both',
      isAllApGroups: false
    }
  ]
}
export const aaalList = [
  {
    id: 2,
    name: 'test2'
  },{
    id: 1,
    name: 'test1'
  }
]

export const mockHotspot20MoreData = {
  name: 'test',
  type: 'hotspot20',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    wlanSecurity: 'WPA2Enterprise'
  },
  managementFrameProtection: 'Disabled',
  hotspot20Settings: {
    allowInternetAccess: true,
    accessNetworkType: Hotspot20AccessNetworkTypeEnum.PRIVATE,
    ipv4AddressType: Hotspot20Ipv4AddressTypeEnum.SINGLE_NATED_PRIVATE
  } as NetworkHotspot20Settings
} as NetworkSaveData

export const mockGuestMoreData = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: false
  },
  guestPortal: {
    guestNetworkType: 'WISPr',
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    macCredentialsDuration: 240,
    userSessionGracePeriod: 1666,
    userSessionTimeout: 6660
  }
} as NetworkSaveData

export const mockGuestMoreDataMinutes = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: false
  },
  guestPortal: {
    guestNetworkType: 'ClickThrough',
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    macCredentialsDuration: 240,
    userSessionGracePeriod: 16,
    userSessionTimeout: 66
  }
} as NetworkSaveData
export const mockGuestMoreDataDays = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: true
  },
  guestPortal: {
    guestNetworkType: 'ClickThrough',
    lockoutPeriod: 120,
    lockoutPeriodEnabled: false,
    macCredentialsDuration: 2422,
    userSessionGracePeriod: 16,
    userSessionTimeout: 1440
  }
} as NetworkSaveData
export const mockGuestMoreDataDaysLockEnable = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: false
  },
  guestPortal: {
    guestNetworkType: 'ClickThrough',
    lockoutPeriod: 1440,
    lockoutPeriodEnabled: true,
    macCredentialsDuration: 2,
    userSessionGracePeriod: 16,
    userSessionTimeout: 1440
  }
} as NetworkSaveData
export const mockGuestMoreDataMinutesLockEnable = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: false
  },
  guestPortal: {
    guestNetworkType: 'ClickThrough',
    lockoutPeriod: 1222,
    lockoutPeriodEnabled: true,
    macCredentialsDuration: 240,
    userSessionGracePeriod: 16,
    userSessionTimeout: 6666
  }
} as NetworkSaveData
export const mockGuestMoreDataLockEnable = {
  name: 'test',
  type: 'guest',
  isCloudpathEnabled: false,
  wlan: {
    bypassCPUsingMacAddressAuthentication: false
  },
  guestPortal: {
    guestNetworkType: 'ClickThrough',
    lockoutPeriod: 120,
    lockoutPeriodEnabled: true,
    macCredentialsDuration: 240,
    userSessionGracePeriod: 1666,
    userSessionTimeout: 6660
  }
} as NetworkSaveData

export const mockMacRegistrationPoolList = {
  content: [
    {
      id: 'c982acee-526a-4b06-8e37-0c96abe6d5f3',
      name: 'macreg1',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-23T10:31:03Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/c982acee-526a-4b06-8e37-0c96abe6d5f3'
        }
      ]
    },
    {
      id: 'ca8e5769-c4ab-42f4-a271-3937405f7d68',
      name: 'macReg2',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-23T10:32:57Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/ca8e5769-c4ab-42f4-a271-3937405f7d68'
        }
      ]
    },
    {
      id: 'c448947f-4354-47d8-bb6b-cc2c754d3312',
      name: 'macReg3',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:38:01Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/c448947f-4354-47d8-bb6b-cc2c754d3312'
        }
      ]
    },
    {
      id: 'd5152d86-3a1b-45ef-9e70-8563e9ce4293',
      name: 'macReg4',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:46:47Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/d5152d86-3a1b-45ef-9e70-8563e9ce4293'
        }
      ]
    },
    {
      id: '9a20a8af-7bbc-4983-9cbb-9349a69f967c',
      name: 'macReg5',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:53:56Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/9a20a8af-7bbc-4983-9cbb-9349a69f967c'
        }
      ]
    }
  ],
  pageable: {
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 5,
  last: true,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  size: 10,
  number: 0,
  numberOfElements: 5,
  first: true,
  empty: false
}

export const mockUpdatedMacRegistrationPoolList = {
  content: [
    {
      id: 'c982acee-526a-4b06-8e37-0c96abe6d5f3',
      name: 'macreg1',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-23T10:31:03Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/c982acee-526a-4b06-8e37-0c96abe6d5f3'
        }
      ]
    },
    {
      id: 'ca8e5769-c4ab-42f4-a271-3937405f7d68',
      name: 'macReg2',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-23T10:32:57Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/ca8e5769-c4ab-42f4-a271-3937405f7d68'
        }
      ]
    },
    {
      id: 'c448947f-4354-47d8-bb6b-cc2c754d3312',
      name: 'macReg3',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:38:01Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/c448947f-4354-47d8-bb6b-cc2c754d3312'
        }
      ]
    },
    {
      id: 'd5152d86-3a1b-45ef-9e70-8563e9ce4293',
      name: 'macReg4',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:46:47Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/d5152d86-3a1b-45ef-9e70-8563e9ce4293'
        }
      ]
    },
    {
      id: '9a20a8af-7bbc-4983-9cbb-9349a69f967c',
      name: 'macReg5',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T08:53:56Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/9a20a8af-7bbc-4983-9cbb-9349a69f967c'
        }
      ]
    },
    {
      id: '1b30c8df-7abc-4483-9cbb-9349a69f968a',
      name: 'macReg6',
      autoCleanup: true,
      priority: 0,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 0,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-02-24T09:53:56Z',
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://dev.ruckus.cloud/macRegistrationPools/9a20a8af-7bbc-4983-9cbb-9349a69f967c'
        }
      ]
    }
  ],
  pageable: {
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    pageNumber: 0,
    pageSize: 10,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 6,
  last: true,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  size: 10,
  number: 0,
  numberOfElements: 6,
  first: true,
  empty: false
}

export const mockPolicySetList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '50f5cec9-850d-483d-8272-6ee5657f53da',
      name: 'testPolicySet',
      description: 'for test'
    },
    {
      id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
      name: 'testPolicySet1',
      description: 'for test'
    }
  ]
}

export const mockAAAPolicyListResponse = {
  page: 1,
  totalCount: 3,
  data: [
    {
      name: 'test1',
      type: 'AUTHENTICATION',
      primary: '1.1.1.2:1812',
      id: '1'
    },
    {
      name: 'policy-id',
      type: 'AUTHENTICATION',
      primary: '2.3.3.4:101',
      secondary: '2.3.3.4:1187',
      id: '2'
    },
    {
      id: '3',
      name: 'RadSec AAA',
      primary: {
        ip: '123.123.123.2',
        port: 2083
      },
      radSecOptions: {
        tlsEnabled: true,
        cnSanIdentity: 'cnSan',
        ocspUrl: 'aaa.com'
      },
      type: 'AUTHENTICATION'
    }
  ]
}

export const mockAAAPolicyTemplateListResponse = {
  page: 1,
  totalCount: 2,
  data: [
    {
      name: 'AAA-Template1',
      type: 'AUTHENTICATION',
      primary: '11.11.11.1:1812',
      id: '1'
    },
    {
      name: 'AAA-Template2',
      type: 'ACCOUNTING',
      primary: '12.12.12.1:1011',
      secondary: '12.12.12.2:1187',
      id: '2'
    }
  ]
}

export const mockCaListResponse = {
  page: 1,
  totalCount: 2,
  data: [
    {
      id: '1',
      name: 'CA-1',
      status: ['VALID']
    },
    {
      id: '2',
      name: 'CA-2',
      status: ['VALID']
    }
  ]
}

export const mockAAAPolicyTemplateResponse = mockAAAPolicyTemplateListResponse.data[1]

export const mockAAAPolicyNewCreateResponse = {
  id: '4',
  name: 'test 3',
  primary: {
    ip: '123.123.123.1',
    port: 1187,
    sharedSecret: '12345678'
  },
  secondary: {
    ip: '123.123.123.2',
    port: 1187,
    sharedSecret: '12345678'
  },
  type: 'AUTHENTICATION'
}

export const mockRadSecAAAPolicyNewCreateResponse = {
  id: '9',
  name: 'test 3',
  primary: {
    ip: '123.123.123.1',
    port: 2083
  },
  radSecOptions: {
    tlsEnabled: true,
    cnSanIdentity: 'cnSan',
    ocspUrl: 'aaa.com'
  },
  type: 'AUTHENTICATION'
}

export const vlanList = [{
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  name: 'test pool',
  vlanMembers: ['2'],
  id: '7b5b3b03492d4a0b84ff9d1d11c4770d'
},
{
  tenantId: 'd1ec841a4ff74436b23bca6477f6a631',
  name: 'test pool2',
  vlanMembers: ['2'],
  id: '0753a360ad9945b88249039ef6734498'
}]

export const mockRbacVlanList = {
  totalCount: 1,
  data: [{
    id: '7b5b3b03492d4a0b84ff9d1d11c4770d',
    name: 'test pool',
    vlanMembers: ['2'],
    wifiNetworkIds: ['id1', 'id2'],
    wifiNetworkVenueApGroups: [
      {
        venueId: '3',
        isAllApGroups: false,
        apGroupIds: [
          'b9eb6106a4d44ac498f1aa89a8fb87d5'
        ]
      }
    ]
  }, {
    id: '0753a360ad9945b88249039ef6734498',
    name: 'test pool2',
    vlanMembers: ['2'],
    wifiNetworkIds: ['id3'],
    wifiNetworkVenueApGroups: [
      {
        venueId: '3',
        isAllApGroups: false,
        apGroupIds: [
          'b9eb6106a4d44ac498f1aa89a8fb87d5'
        ]
      }
    ]
  }]
}

export const mockedTunnelProfileViewData = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1',
      tags: ['tag1'],
      mtuType: 'MANUAL',
      mtuSize: 1450,
      forceFragmentation: true,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      type: 'VXLAN'
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      type: 'VXLAN'
    },
    {
      id: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      name: 'Default',
      tags: ['tag2'],
      mtuType: 'AUTO',
      mtuSize: 0,
      forceFragmentation: false,
      personalIdentityNetworkIds: ['nsg1', 'nsg2'],
      networkIds: ['network1', 'network2'],
      type: 'VXLAN'
    }
  ]
}

export const network = {
  type: NetworkTypeEnum.AAA,
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: RadioEnum.Both,
      isAllApGroups: true,
      allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  wlan: {
    enabled: true,
    ssid: '03',
    vlanId: 1
  },
  name: '03',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

export const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      allApDisabled: false
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      wlan: { wlanSecurity: WlanSecurityEnum.WPA3 }
    }
  ]
}

export const networkVenue_allAps = {
  venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: true,
  allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  id: '7a97953dc55f4645b3cdbf1527f3d7cb'
}

export const networkVenue_apgroup = {
  venueId: '02e2ddbc88e1428987666d31edbc3d9a',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: false,
  id: '7a97953dc55f4645b3cdbf1527f3d7cb',
  scheduler: {
    type: SchedulerTypeEnum.ALWAYS_ON
  },
  apGroups: [{
    radio: RadioEnum._2_4_GHz,
    radioTypes: [RadioTypeEnum._2_4_GHz],
    isDefault: true,
    apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
    apGroupName: 'APs not assigned to any group',
    vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
    vlanPoolName: 'pool1'
  }]
}

export const mockHotspot20OperatorList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '0b9b52ea3209466ab5c17ee73edb41bf',
      name: 'operator1'
    },
    {
      id: 'c61df04c218e46d2880afd4c25493202',
      name: 'operator2'
    },
    {
      id: '2048008715d340db9ce9572e72dcfead',
      name: 'operator3'
    }
  ]
}

export const mockHotpost20IdentityProviderList = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 15,
  page: 1,
  data: [
    {
      id: 'bad92ccf19174f0db5f9edae47ad93da',
      name: 'provide_4'
    },
    {
      id: 'a45f756715fc4eeba1d86132e1503fd2',
      name: 'provider_1'
    },
    {
      id: '599deb6758bd4f0fa702f2e1cb565102',
      name: 'provider_10'
    },
    {
      id: 'f464009202e74c11b94d9148e6a49dd6',
      name: 'provider_11'
    },
    {
      id: '251a7a77b9ab4539babe40bd3c7834da',
      name: 'provider_12'
    },
    {
      id: '1e3df6c84d2e4e2bac744085f8b38947',
      name: 'provider_13'
    },
    {
      id: 'c2a49ac912184787ab5baf1279ba2675',
      name: 'provider_14'
    },
    {
      id: 'b2dc059157fd40bb83e72f43829f8d92',
      name: 'provider_15'
    },
    {
      id: '2a2401edb87245a583f89d07c9fe5cf9',
      name: 'provider_2'
    },
    {
      id: '0ddaf3a31ab9490981ef0e6612694e08',
      name: 'provider_3'
    },
    {
      id: 'e86749fafa3d4b719b2966a256b0cbb6',
      name: 'provider_5'
    },
    {
      id: 'de2b37b523af437b9898d715451bc086',
      name: 'provider_6'
    },
    {
      id: '78cc2f9260c2435e81a4ce102061fed7',
      name: 'provider_7'
    },
    {
      id: '5c805dbbd6ec490aac12d31f06f4c5b9',
      name: 'provider_8'
    },
    {
      id: 'b1de5ae07ebf4e7d833a6a6542ad9f73',
      name: 'provider_9'
    }
  ]
}
export const mockWifiCallingDetail = {
  networkIds: [
    '44c5604da90443968e1ee91706244e63',
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '5cae9e28662447008ea86ec7c339661b'
  ],
  description: 'for test',
  qosPriority: 'WIFICALLING_PRI_VOICE',
  name: 'wifiCSP1',
  id: 'wifiCallingServiceId1',
  epdgs: [
    {
      ip: '1.2.3.4',
      domain: 'abc.com'
    },
    {
      domain: 'def.com'
    }
  ]
}

export const mockWifiCallingTableResult = {
  fields: ['ePDGs', 'epdg', 'qosPriority', 'networkIds', 'epdgs', 'name', 'tenantId', 'id'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'b6ebccae545c44c1935ddaf746f5b048',
      name: 'wifi-1',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      networkIds: [],
      tenantId: '1977de24c7824b0b975c4d02806e081f',
      epdgs: [
        {
          domain: 'a.b.comd'
        }
      ]
    }
  ]
}

export const macRegistrationList = {
  content: [
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
      name: 'Registration pool',
      description: '',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 5
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

export const mockSMS_R1_Over100 = {
  threshold: 80,
  provider: SmsProviderType.RUCKUS_ONE,
  ruckusOneUsed: 100
}

export const mockSMS_R1_Under100 = {
  threshold: 80,
  provider: SmsProviderType.RUCKUS_ONE,
  ruckusOneUsed: 80
}

export const mockSMS_TWILIO_Under100 = {
  threshold: 80,
  provider: SmsProviderType.TWILIO,
  ruckusOneUsed: 80
}

export const mockSMS_TWILIO_Over100 = {
  threshold: 80,
  provider: SmsProviderType.TWILIO,
  ruckusOneUsed: 100
}

export const mockSMS_Unset_Over100 = {
  threshold: 80,
  provider: SmsProviderType.SMSProvider_UNSET,
  ruckusOneUsed: 100
}

export const mockSMS_Unset_Under100 = {
  threshold: 80,
  provider: SmsProviderType.SMSProvider_UNSET,
  ruckusOneUsed: 80
}

export const mock_SelfSignIn_SMS_ON = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    guestNetworkType: GuestNetworkTypeEnum.SelfSignIn,
    enableSmsLogin: true,
    socialIdentities: {
      facebook: { source: SocialIdentitySource.CUSTOM },
      google: { source: SocialIdentitySource.CUSTOM },
      twitter: { source: SocialIdentitySource.CUSTOM },
      linkedin: { source: SocialIdentitySource.CUSTOM }
    },
    socialEmails: true,
    socialDomains: ['http://123.com'],
    smsPasswordDuration: {
      duration: 12,
      unit: TimeUnitEnum.HOUR
    }
  }
}

export const mock_SelfSignIn_SMS_Off = {
  guestPortal: {
    redirectUrl: 'dbaidu.com',
    guestNetworkType: GuestNetworkTypeEnum.SelfSignIn,
    enableSmsLogin: true,
    socialIdentities: {
      facebook: { source: SocialIdentitySource.CUSTOM },
      google: { source: SocialIdentitySource.CUSTOM },
      twitter: { source: SocialIdentitySource.CUSTOM },
      linkedin: { source: SocialIdentitySource.CUSTOM }
    },
    socialEmails: true,
    socialDomains: ['http://123.com'],
    smsPasswordDuration: {
      duration: 12,
      unit: TimeUnitEnum.HOUR
    }
  }
}

export const mock_SelfSignIn_WhatsApp_Error = {
  guestPortal: {
    redirectUrl: '123.com',
    guestNetworkType: GuestNetworkTypeEnum.SelfSignIn,
    enableSmsLogin: false,
    enableWhatsapp: true,
    socialIdentities: {
      facebook: { source: SocialIdentitySource.CUSTOM },
      google: { source: SocialIdentitySource.CUSTOM },
      twitter: { source: SocialIdentitySource.CUSTOM },
      linkedin: { source: SocialIdentitySource.CUSTOM }
    },
    socialEmails: true,
    socialDomains: ['http://123.com'],
    smsPasswordDuration: {
      duration: 12,
      unit: TimeUnitEnum.HOUR
    }
  }
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
          wifiNetworkIds: ['network_1', 'network_2', 'network_3']
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

export const mockedDirectoryServerProfiles = {
  fields: [
    'wifiNetworkIds',
    'port',
    'domainName',
    'name',
    'host',
    'id',
    'type'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '532b91ca9330441bb90d50628911a10e',
      name: 'ldap-profile1',
      host: '0.tcp.jp.ngrok.io',
      port: 13984,
      type: 'LDAP',
      domainName: 'dc=test,dc=tw',
      wifiNetworkIds: [
        '5c342542bb824a8b981a9bb041a8a2da'
      ]
    },
    {
      id: '58d667552aac4fc3bc235cf39bfbe889',
      name: 'ldap-profile3',
      host: '1.169.93.183',
      port: 389,
      type: 'LDAP',
      domainName: 'dc=tdcad,dc=com',
      wifiNetworkIds: []
    },
    {
      id: '49d2173ae5d943daa454af8de40fd4d9',
      name: 'ldap-profile4',
      host: '1.169.93.183',
      port: 389,
      type: 'LDAP',
      domainName: 'dc=tdcad,dc=com',
      wifiNetworkIds: [
        '5c342542bb824a8b981a9bb041a8a2da'
      ]
    },
    {
      id: 'a5ac9a7a3be54dba9c8741c67d1c41fa',
      name: 'Online LDAP Test Server',
      host: 'ldap.forumsys.com',
      port: 389,
      type: 'LDAP',
      domainName: 'ou=mathematicians,dc=example,dc=com',
      wifiNetworkIds: []
    },
    {
      id: '3596facbfd884b6da9ab40670c8ee397',
      name: 'Online LDAP Test Server2',
      host: 'ldap.forumsys.com',
      port: 389,
      type: 'AD',
      domainName: 'ou=mathematicians,dc=example,dc=com',
      wifiNetworkIds: [
        'adfdc7ef63e94c8da16e379e7e443fd1'
      ]
    }
  ]
}

export const mockedMacRegistrationPools = {
  content: [
    {
      id: '47f3d966-4204-455a-aa23-749cec8e0484',
      name: '0823-MAC pool',
      autoCleanup: true,
      expirationType: 'WEEKS_AFTER_TIME',
      expirationOffset: 5,
      expirationEnabled: true,
      registrationCount: 1,
      defaultAccess: 'ACCEPT',
      createdDate: '2023-08-23T04:19:26Z',
      policySetId: 'b3fb4ed7-b793-42d3-9669-9f7a90735eac',
      networkIds: [
        'eef68a729f2a455cb03b575fcbe80ca7',
        '02db26b004f34df0bc08217a754018d2'
      ],
      isReferenced: false,
      networkCount: 2,
      links: [
        {
          rel: 'self',
          // eslint-disable-next-line max-len
          href: 'https://api.dev.ruckus.cloud/macRegistrationPools/47f3d966-4204-455a-aa23-749cec8e0484'
        }
      ]
    }
  ],
  pageable: {
    sort: {
      empty: true,
      unsorted: true,
      sorted: false
    },
    offset: 0,
    pageNumber: 0,
    pageSize: 20,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 1,
  last: true,
  size: 20,
  number: 0,
  sort: {
    empty: true,
    unsorted: true,
    sorted: false
  },
  first: true,
  numberOfElements: 1,
  empty: false
}

export const mockIdentityGroupQuery = {
  totalElements: 4,
  totalPages: 1,
  size: 2000,
  content: [
    {
      id: 'd613141c-780f-4296-8795-4289489a73a7',
      name: 'DPSK_auto-generated-from-dpsk_d6131',
      description: null,
      dpskPoolId: '3afaeffc909e468691045ac499f02504',
      macRegistrationPoolId: null,
      propertyId: null,
      createdAt: '2025-01-13T10:24:18.603153Z',
      updatedAt: '2025-01-28T05:17:50.486872Z',
      certificateTemplateId: null,
      policySetId: null,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/d613141c-780f-4296-8795-4289489a73a7'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 1
    },
    {
      id: '68c6f030-2aa9-4911-b116-7c50cf17f08c',
      name: 'Identity_Group_68c6f030-2aa9-4911-b116-7c50cf17f08c',
      description: null,
      dpskPoolId: null,
      macRegistrationPoolId: '752bbef5-a645-4cb0-861b-545843cfa6f9',
      propertyId: null,
      createdAt: '2025-01-09T06:10:38.81519Z',
      updatedAt: '2025-01-20T13:19:54.531194Z',
      certificateTemplateId: null,
      policySetId: null,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/68c6f030-2aa9-4911-b116-7c50cf17f08c'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 0
    },
    {
      id: '0d973a0e-15e1-46cb-884a-d3d04bdc8db8',
      name: 'IG-1',
      description: null,
      dpskPoolId: '317a063e01c44467871b9a28a42bcdd6',
      macRegistrationPoolId: null,
      propertyId: null,
      createdAt: '2025-02-26T16:47:45.081437Z',
      updatedAt: '2025-02-26T17:03:18.620709Z',
      certificateTemplateId: null,
      policySetId: null,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/0d973a0e-15e1-46cb-884a-d3d04bdc8db8'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 11
    },
    {
      id: '4e548bc7-e473-49eb-98c8-617de8ca516a',
      name: 'IG-2',
      description: null,
      dpskPoolId: null,
      macRegistrationPoolId: null,
      propertyId: null,
      createdAt: '2025-02-26T16:52:58.297587Z',
      updatedAt: '2025-02-26T16:52:58.297587Z',
      certificateTemplateId: null,
      policySetId: null,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/4e548bc7-e473-49eb-98c8-617de8ca516a'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 5
    }
  ],
  number: 0,
  sort: {
    empty: false,
    unsorted: false,
    sorted: true
  },
  last: true,
  pageable: {
    pageNumber: 0,
    pageSize: 2000,
    sort: {
      empty: false,
      unsorted: false,
      sorted: true
    },
    offset: 0,
    unpaged: false,
    paged: true
  },
  first: true,
  numberOfElements: 4,
  empty: false
}
