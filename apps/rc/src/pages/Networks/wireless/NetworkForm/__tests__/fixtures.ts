
import {
  GuestNetworkTypeEnum,
  SocialIdentitySource,
  TimeUnitEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  WlanSecurityEnum,
  AuthRadiusEnum
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

export const wifiCloudpathResponse = [
  {
    name: 'twoserver',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '4.4.4.4',
        port: 4444,
        sharedSecret: '666666'
      },
      id: '71da40ca44144030a861668cf22f4ec7'
    },
    accountingRadius: {
      primary: {
        ip: '5.5.5.5',
        port: 5555,
        sharedSecret: '666666'
      },
      id: 'd5f3a867ec95466085a939475f396fd7'
    },
    id: '2b94e9cbf3454b71af9ee06af0fcb5ba'
  },
  {
    name: 'test1',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '1.1.1.1',
        port: 11111,
        sharedSecret: '111111'
      },
      id: 'c7f1dfd9ae86482f9a98c939a3202438'
    },
    id: '46ec9547703b424daa9614ea8e80160f'
  },
  {
    name: 'test server 2',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '2.2.2.2',
        port: 2222,
        sharedSecret: '222222'
      },
      id: 'd3753ce508a44633bfd4ad673174ad30'
    },
    id: '6116be7334be493e85a9db7a4efe5576'
  },
  {
    name: 'test2',
    deploymentType: 'Cloud',
    authRadius: {
      primary: {
        ip: '1.1.1.1',
        port: 10,
        sharedSecret: '888888888888888'
      },
      id: 'ceed9973ad994ffbb5b26538fece3005'
    },
    id: 'decbac6f92244933b7ccaba4e06c5137'
  }
]

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

export const successResponse = { requestId: 'request-id' }

export const cloudpathResponse = [
  {
    authRadius: {
      primary: {
        ip: '5.54.58.5',
        port: 56,
        sharedSecret: '454545'
      },
      id: 'c615bf8c82dc404ebb98c7e89672ef29'
    },
    accountingRadius: {
      primary: {
        ip: '5.54.58.6',
        port: 57,
        sharedSecret: '454545'
      },
      id: 'c615bf8c82dc404ebb98c7e89672ef29'
    },
    deploymentType: 'Cloud',
    id: '6edb22ef74b143f280f2eb3105053840',
    name: 'cloud_02'
  },
  {
    authRadius: {
      primary: {
        ip: '3.2.34.5',
        port: 56,
        sharedSecret: 'GFHFGH'
      },
      id: '296ee3f68c434aa4bc3b3ba1f7272806'
    },
    accountingRadius: {
      primary: {
        ip: '3.2.34.6',
        port: 57,
        sharedSecret: 'GFHFGH'
      },
      id: '296ee3f68c434aa4bc3b3ba1f7272806'
    },
    deploymentType: 'Cloud',
    id: '5cc1d4a21c4d41b8ab1a839a0e03cc8c',
    name: 'cloud_01'
  }
]

export const policyListResponse = {
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

export const layer2PolicyListResponse = [
  {
    id: 'dee8918e1c40474a9f779b39ee672c5b',
    name: 'layer2policy1',
    macAddressesCount: 1,
    networksCount: 0
  }
]

export const layer3PolicyListResponse = [
  {
    id: '4dee545ff0e04100b13774aa0ba6fc57',
    name: 'layer3policy1',
    rulesCount: 1,
    networksCount: 0
  }
]

export const accessControlListResponse = [
  {
    l2AclPolicy: {
      id: 'dee8918e1c40474a9f779b39ee672c5b',
      enabled: true
    },
    l3AclPolicy: {
      id: '4dee545ff0e04100b13774aa0ba6fc57',
      enabled: true
    },
    name: 'acl-1',
    rateLimiting: {
      uplinkLimit: 0,
      downlinkLimit: 0,
      enabled: false
    },
    id: '2918e310075a4f5bb1b0d161769f6f64'
  }
]

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
}

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
}

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
}
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
}
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
}
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
}
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
}

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

export const mockAAAPolicyResponse = [{
  id: '1',
  name: 'test1',
  type: 'AUTHENTICATION',
  primary: {
    ip: '1.1.1.2',
    port: 1812,
    sharedSecret: '111211121112'
  }
}]
