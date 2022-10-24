/* eslint-disable max-len */
import { ExternalAntenna, GuestNetworkTypeEnum, RadioEnum, RadioTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
  totalCount: 10,
  page: 1,
  data: [{
    city: 'New York',
    country: 'United States',
    description: 'My-Venue',
    id: '2c16284692364ab6a01f4c60f5941836',
    latitude: '40.769141',
    longitude: '-73.9429713',
    name: 'My-Venue',
    status: '1_InSetupPhase',
    aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
  }, {
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
    clients: 1
  }]
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
  id: '4c778ed630394b76b17bce7fe230cf9f',
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

export const venueLed = [{
  ledEnabled: true,
  model: 'E510'
}]

export const venueApModels = [{
  models: []
}]

export const autocompleteResult = {
  address_components: [
    {
      long_name: '350',
      short_name: '350',
      types: [
        'street_number'
      ]
    },
    {
      long_name: 'West Java Drive',
      short_name: 'W Java Dr',
      types: [
        'route'
      ]
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: [
        'country',
        'political'
      ]
    },
    {
      long_name: '94089',
      short_name: '94089',
      types: [
        'postal_code'
      ]
    },
    {
      long_name: '1026',
      short_name: '1026',
      types: [
        'postal_code_suffix'
      ]
    }
  ],
  // eslint-disable-next-line max-len
  adr_address: '<span class=\'street-address\'>350 W Java Dr</span>, <span class=\'locality\'>Sunnyvale</span>, <span class=\'region\'>CA</span> <span class=\'postal-code\'>94089-1026</span>, <span class=\'country-name\'>USA</span>',
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
  icon_mask_base_uri: 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '350 W Java Dr',
  place_id: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  reference: 'ChIJp5L7yL63j4ARCqQI-eAJu0A',
  types: [
    'premise'
  ],
  // eslint-disable-next-line max-len
  url: 'https://maps.google.com/?q=350+W+Java+Dr,+Sunnyvale,+CA+94089,+USA&ftid=0x808fb7bec8fb92a7:0x40bb09e0f908a40a',
  utc_offset: -420,
  vicinity: 'Sunnyvale'
}

export const timezoneResult = {
  dstOffset: 3600,
  rawOffset: -28800,
  status: 'OK',
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

export const venueSetting = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  wifiFirmwareVersion: '6.2.0.103.486',
  countryCode: 'US',
  mesh: {
    enabled: true
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
      ['1','5','9','13','17','21','25','29','33','37','41','45','49','53','57','61','65','69','73','77','81','85','89','93','97','101','105','109','113','117','121','125','129','133','137','141','145','149','153','157','161','165','169','173','177','181','185','189','193','197','201','205','209','213','217','221'],
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      changeInterval: 33,
      txPower: 'MAX' },
    radioParamsDual5G: {
      inheritParamsLower5G: true,
      radioParamsLower5G: {
        allowedIndoorChannels: ['36','40','44','48','52','56','60','64'],
        allowedOutdoorChannels: ['36','40','44','48','52','56','60','64'],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      },
      inheritParamsUpper5G: true,
      radioParamsUpper5G: {
        // eslint-disable-next-line max-len
        allowedIndoorChannels: ['100','104','108','112','116','120','124','128','132','136','149','153','157','161'],
        // eslint-disable-next-line max-len
        allowedOutdoorChannels: ['100','104','108','112','116','120','124','128','132','136','149','153','157','161'],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      }
    },
    radioParams24G: {
      allowedChannels: ['1','2','3','4','5','6','7','8','9','10','11'],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    },
    radioParams50G: {
      combineChannels: false,
      // eslint-disable-next-line max-len
      allowedIndoorChannels: ['36','40','44','48','52','56','60','64','100','104','108','112','116','120','124','128','132','136','149','153','157','161'],
      // eslint-disable-next-line max-len
      allowedOutdoorChannels: ['36','40','44','48','52','56','60','64','100','104','108','112','116','120','124','128','132','136','149','153','157','161'],
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
  },dhcpServiceSetting: {
    enabled: false,
    mode: 'EnableOnEachAPs',
    wanPortSelectionMode: 'Dynamic'
  },rogueAp: {
    enabled: false,
    reportThreshold: 0
  },
  enableClientIsolationAllowlist: false,
  id: 'f892848466d047798430de7ac234e940'
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
        names: []
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
        names: []
      },
      aps: 0,
      description: '',
      clients: 0,
      captiveType: GuestNetworkTypeEnum.ClickThrough,
      activated: { isActivated: false }
    }
  ]
}

export const venueNetworkApGroup = {
  response: [
    {
      venueId: '45aa5ab71bd040be8c445be8523e0b6c',
      networkId: 'd556bb683e4248b7a911fdb40c307aa5',
      apGroups: [
        {
          id: 'test',
          apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
          radio: 'Both',
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false
        }
      ],
      isAllApGroups: false,
      allApGroupsRadio: 'Both'
    },
    {
      venueId: '45aa5ab71bd040be8c445be8523e0b6c',
      networkId: 'cd922ec00f744a16b4b784f3305ec0aa',
      apGroups: [
        {
          apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
          radio: 'Both',
          isDefault: true,
          validationErrorReachedMaxConnectedNetworksLimit: false,
          validationErrorSsidAlreadyActivated: false,
          validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
          validationError: false
        }
      ],
      isAllApGroups: false,
      allApGroupsRadio: 'Both'
    }
  ]
}

export const networkDeepList = {
  response: [
    {
      type: 'aaa',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA3,
        advancedCustomization: {
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
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'OFDM',
            managementFrameMinimumPhyRate: '6'
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          accessControlEnable: false,
          respectiveAccessControl: false,
          applicationPolicyEnable: false,
          l2AclEnable: false,
          l3AclEnable: false,
          wifiCallingEnabled: false,
          singleSessionIdAccounting: false,
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
      id: 'cd922ec00f744a16b4b784f3305ec0aa'
    },
    {
      type: 'psk',
      wlan: {
        wlanSecurity: WlanSecurityEnum.WPA2Personal,
        advancedCustomization: {
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
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'OFDM',
            managementFrameMinimumPhyRate: '6'
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
          dnsProxyEnabled: false
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

export const venueApsList = { fields: ['meshRole','serialNumber'],totalCount: 0,page: 1,data: [] }

export const venueDosProtection = {
  enabled: true,
  blockingPeriod: 50,
  failThreshold: 6,
  checkPeriod: 30
}

export const venueRougeAp = {
  enabled: true,
  reportThreshold: 0,
  roguePolicyId: '9700ca95e4be4a22857f0e4b621a685f'
}

export const venueRoguePolicy = [{
  venues: [{ id: '3db73a30cd06490aaf4bca01a1eb8894',name: 'My-Venue' }],
  name: 'Default profile',
  rules: [
    { name: 'Same Network Rule',type: 'SameNetworkRule',classification: 'Malicious',priority: 1 },
    { name: 'Mac Spoofing Rule',type: 'MacSpoofingRule',classification: 'Malicious',priority: 2 },
    { name: 'SSID Spoofing Rule',type: 'SsidSpoofingRule',classification: 'Malicious',priority: 3 },
    { name: 'RTS Abuse Rule',type: 'RTSAbuseRule',classification: 'Malicious',priority: 4 },
    { name: 'CTS Abuse Rule',type: 'CTSAbuseRule',classification: 'Malicious',priority: 5 },
    { name: 'Deauth Flood Rule',type: 'DeauthFloodRule',classification: 'Malicious',priority: 6 },
    { name: 'Disassoc Flood Rule',type: 'DisassocFloodRule',
      classification: 'Malicious',priority: 7 },
    { name: 'Excessive Power Rule',type: 'ExcessivePowerRule',
      classification: 'Malicious',priority: 8 },
    { name: 'Null SSID Rule',type: 'NullSSIDRule',classification: 'Malicious',priority: 9 },
    { name: 'Adhoc',type: 'AdhocRule',classification: 'Unclassified',priority: 10 }],
  id: '9700ca95e4be4a22857f0e4b621a685f' }
]
export const configProfiles = [{
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
}, {
  id: '6a757409dc1f47c2ad48689db4a0846a',
  name: 'profile01',
  profileType: 'Regular',
  venues: ['My-Venue', 'My-Venue2']
}, {
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
}, {
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
}, {
  acls: [{
    aclType: 'standard',
    id: 'ae7ea5418aee4048b8122e2ae20a243b',
    name: 'aaa'
  }],
  id: '74ee9d8bb08b47218926d9bc33f6167f',
  name: 'profile02',
  profileType: 'Regular',
  trustedPorts: [{
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
  }, {
    id: '2cdada96178343be93c6b8a998115259',
    model: 'ICX7850-48FS',
    slots: [
      { slotNumber: 2, enable: true, option: '8X40/100G' },
      { slotNumber: 1, enable: true }
    ],
    trustPorts: ['1/1/3'],
    trustedPortType: 'all',
    vlanDemand: false
  }],
  vlans: [{
    arpInspection: false,
    id: '0abd832af3e542f58341c85cf180ab2b',
    igmpSnooping: 'passive',
    ipv4DhcpSnooping: true,
    multicastVersion: 3,
    spanningTreeProtocol: 'stp',
    vlanId: 2
  }]
}]

export const venueSwitchSetting = [{
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['6a757409dc1f47c2ad48689db4a0846a'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}, {
  cliApplied: true,
  dns: ['1.1.1.10'],
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['771f6e6b21af43fa8879e10170114fc4', '69248dfe1d5b400199304447b45a1700'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}, {
  cliApplied: false,
  id: '45aa5ab71bd040be8c445be8523e0b6c',
  name: 'My-Venue',
  profileId: ['74ee9d8bb08b47218926d9bc33f6167f'],
  switchLoginPassword: 'xxxxxxxxx',
  switchLoginUsername: 'admin',
  syslogEnabled: false
}]

export const switchConfigProfile = [{
  id: '6a757409dc1f47c2ad48689db4a0846a',
  name: 'profile01',
  profileType: 'Regular',
  venues: ['45aa5ab71bd040be8c445be8523e0b6c']
}, {
  id: '74ee9d8bb08b47218926d9bc33f6167f',
  name: 'profile02',
  profileType: 'Regular',
  acls: [{
    aclRules: [{
      sequence: 65000,
      action: 'permit',
      source: 'any',
      id: 'c2a17d8e5ea048baa220a6ca1a68ad54'
    }],
    name: 'test-acl',
    aclType: 'standard',
    id: 'ae7ea5418aee4048b8122e2ae20a243b'
  }],
  trustedPorts: [{
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
  }, {
    id: '2cdada96178343be93c6b8a998115259',
    model: 'ICX7850-48FS',
    slots: [
      { slotNumber: 2, enable: true, option: '8X40/100G' },
      { slotNumber: 1, enable: true }
    ],
    trustPorts: ['1/1/3'],
    trustedPortType: 'all',
    vlanDemand: false
  }],
  vlans: [{
    vlanId: 2,
    vlanName: 'test-vlan',
    ipv4DhcpSnooping: true,
    arpInspection: false,
    igmpSnooping: 'passive',
    multicastVersion: 3,
    spanningTreeProtocol: 'stp',
    switchFamilyModels: [{
      id: '5b902550c38343198059598a074c0e01',
      model: 'ICX7550-24P',
      slots: [
        { slotNumber: 2, enable: true, option: '2X40G' },
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/1/2',
      untaggedPorts: '1/1/22,1/1/24'
    }],
    id: '0abd832af3e542f58341c85cf180ab2b'
  }]
}]

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
      allowDfsCountry: [
        'US',
        'SG'
      ],
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
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/e510.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360552&Signature=Mv%2BMAuVUIlgxIyK%2FqT0pbPllGYpxAoJvLwOnAx48ibKNGFVJ3eobxvpbctu5rCVDW14nakRxqaqcDph5AHvmVJZqmbFTJFD6OOWGv3tpVrx5mIbOcriib2tRgl74%2FfJWZbKNxHhVGZqyYcVbGaTBWpxZMh4OHvhIjAKB4wWd5WZtqBLz3A%2BoiPXKVs59lTPga%2BzsoFzAdcuH1Xd3yWbcR6QSOD5RNeUfpUIa%2Fr7LdlZDMw3QmcPKZlpL3hmlK6%2Fj6SeLY2Zr1fuuRyunjR38s0PC%2FMR3g6gMGFXQDp8L%2FAyvygsSu%2BiTkU7bfp75ncKC50qj0HKKlNfQAxCce9lPdw%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/appearance-e510.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360552&Signature=BQkBmg5cRnf49LRr8cuf%2Fwy%2By5NoFTYOBxRBl4ysnKLI4TiZI3OEJ2sfHbNV9wIET7pXA29S0f3DdBj3KA1DgErNt0Fsh9TlBixzRxfLh3KNYugoE2vG0IorF%2FdCFTQd1XLqyOmdAELEb%2FviZVxihNvwicLu4xQvZI0ct2hw7hlkioK2HQJCoCqiS9mF2Acgc0OQ6v3VaeaWF9qr0WG0W4cDVpFyNxgKG4wtwFk0Co1ZlKmzYsNeR81wJiCXieeuStAtEqn8IwnNGcbpVdX9eBEEbL2j8Gj8TJbTVPmtXiigot8erQZBAJqW9ntbllL64au8BfFYpodUutcBGXjd5w%3D%3D',
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
      allowDfsCountry: [
        'US',
        'SG'
      ],
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
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/t300e.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360554&Signature=JkUWlNY%2FdEMDe7fHZZVL2aFsDlM7xPNTnih9TMwdDGUs%2B79N1uPk7Nj%2FBGCu%2FfIS8LSER3WGTg2SyALiiKd3QU36NF3MJYgDJSr3aqu1sfI8b4qnUVTVRSMPWa8qvAChl8bCVaVu%2BWUug7NFZE7qKZNfz6ieqjjLE%2FYXmzHbz9ew1D5PblwRKKRmGDgt8z90UuEXnrqk1Fs5popwXrkKfLNNZX0rbZ5tEA%2Ba4c%2Fn%2F5ye0YNHzH0PGfKGBPagmss7HJiJ64Lj2RKWTvrnmsgoYndLSpbFjFW5wt4kuzX%2Feh9LL16xVbLSKqNkaoGLZwt9ION3o2kVKrGcqAGynJjW9g%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/appearance-t300e.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360554&Signature=OkwHtgmgZAxl01FI%2F8MSiDXBk12ZSSqIjyi8hNpvYOjyRh9RUDqXFSAjhh45yJhyGNRJMQ6A3ZS5ZblzA%2Fret%2FP8Q0SS7GvaXfuldOYZYgxR%2F3R1HEYVA8pnIDRfMAN3I98jlqwBWWZg9nGFPBwXOstFHu%2F4d7Uih54KZpQA7JOV5Bb4EHj%2BlKMprJqBSJkQbXDxYUzcEN0X4v4NY2vjXskHD9z%2BBR9HqmIiZ3eNPs5VVnpZIMNBV5IYSkCJLm1SdLtICpXwXm0b%2FV6rDYlCrtxS1GH0XOPLRUS%2BHRCGjoDGU3d6FaLdNiIG5J3GQ3wu5g10AVVAR1UZJRFjIBKI7A%3D%3D',
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
      allowDfsCountry: [
        'US',
        'SG'
      ],
      allowCbandCountry: [
        'GB'
      ],
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
      poeModeCapabilities: [
        'Auto',
        '802.3af',
        '802.3at'
      ],
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/t350se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360554&Signature=FaTWx6J4bpnC0jpuLGXJbpz3sFmo02yJyhFr6xQ3nO4hkC%2BkbAN1QBr5forzkiej5jugJK6hjZk2TeVkvp1Yzbf6bs45YcD%2B3wE%2FckDDJkaagyZR5hkTKckyZXeJiw3yzkExZKRiYCidgdvkiBr1Aei0wXguj5QcdRtDIYU8T%2BW49kuEo9vo%2BvHIoBDf%2FbozcTnoMbHFb7ySS%2BLbmwipAvusJLL4mG13dOGNrWalKB1h92YWmGMzSGihHRAwxGhlAgT55Yw2U73X2u1GoLTt14BaKj3LAyjX%2BhLyaXMmYUlV6IApze3jRDeB0253Rv57ipQUbTbr%2FyXDUlOMFlu40A%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/appearance-t350se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360554&Signature=cGpqgx0R9TGzheyvbsiTprvigZuSJu101peG%2FAFzSE9jvpnqhGcxmGMtspVwdIq2Q0JQyWiU%2Br6XkdL9fT9wbzVSq916RMPuCINzHhsHtTGfjbK0748vY12PU0C8e775jn%2BlvsEGwgcU5fA16LQxzHYLLbfjdMnIod1FqmfcKw39ZUpztGrZZIZ0KLb%2FGVo1V%2FVmuHXeKAICpvLVNHMZmR5CF3GrCx07VeJ5N2YiZ%2FWRh5qAbnwIv3VhTxtR1cT%2BR975PMUrIl08IaMV4R9V2E%2B7VmmBDFIoLI%2BPcv9GOe%2F7oUBCkw1%2F7eftx5ggAPVDmGNpV0xV85EdQOl19G4k9A%3D%3D',
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
      allowDfsCountry: [
        'US',
        'SG'
      ],
      allowCbandCountry: [
        'GB'
      ],
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
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/t750se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360555&Signature=OGe2ztxZKG3eq%2BnUIlVVazwlaPV5pG0j3%2BFXiaGrWOTL1Xxemm5%2FjGp1Bwp%2BbUaAs2995zQP7%2FZfLodSOMNzpOJ2i2WPN7MNiNVp2IxyCIiRZ0P66xtAbBThxBz13p3rQ51k5Faac1KQlIBfCUcKl9gd9fFLzFfA8dXlmjRHLhXIR6UXy3Tldcmpe9ae51bOmJtpQekIPw0AClOpgvi5RCjMEdT3Y4lomRvV6pCvVL6GD2ZWPUwtEdvTE6K2%2BjbU6Uo4GwvnCHOMRZ05Eppc5YRqUBnoYe6YDIlUXrHobz1C%2BBOTbCR0ggmrWafg6zZfSaDQKDrNETOmFff%2FDdsoPA%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/6.2.0.103.500/appearance-t750se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1697360555&Signature=aRWgJxGnOgJ%2BR%2BrOVF%2F%2F3VHM%2BiJimHls1Eg1Wj0ndcsDzaylvIpz%2BV2Mjo%2BwXBnV0Gx0gilFS7eFISxVX8Z6kL%2B5CGmwXXGTU%2F%2FTG9FKworqMHUd4UP%2BXyGIoUoinW9752EeNmR6w%2FEZ9tivDciVFuQn%2BygwSn6qO8yzOCg6BXZB40bGryR6PhXXvJqSNGHS19sjnZGLDSNsbHCYd148pRjkLknEz6wRVyaUEj9I21Vg1p9WikFfffpO9hSiISG39zMrZT1VolS6571GxK%2F1nvAG%2FUqNPQ%2BJZsRhVF84PjV904jWmdwMinI4nZ5qkq1%2BPNUdYbMyHm0hX0v5KYbjVg%3D%3D',
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
    enable24G: false, enable50G: false, model: 'E510', gain24G: 3,
    gain50G: 3, supportDisable: true
  }, T300E: {
    enable50G: true, gain50G: 8,
    model: 'T300E', supportDisable: true
  }, T350SE: {
    enable24G: true, enable50G: true,
    gain24G: 9, gain50G: 9, model: 'T350SE', supportDisable: true, coupled: true
  }, T750SE: {
    enable24G: true, enable50G: true, gain24G: 10, gain50G: 10, model: 'T750SE',
    supportDisable: true, coupled: true
  }
} as unknown as {
  [index: string]: ExternalAntenna;
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
    { id: '7829365a824e477d81332cfacfe29b95',
      name: 'admin',
      username: 'admin',
      password: '@cVp14FH_v',
      purpose: 'DEFAULT',
      level: 'READ_WRITE',
      serverType: 'LOCAL',
      authPort: 0
    },
    {
      id: '6c4aea92d32e4875a5b736db83875eb6',
      name: 'yguo1',
      username: 'yguo1',
      password: '12dC@jkfjk',
      level: 'READ_WRITE',
      serverType: 'LOCAL'
    }],
  totalCount: 2,
  totalPages: 1,
  page: 1
}
