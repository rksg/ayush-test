import { GuestNetworkTypeEnum, WlanSecurityEnum } from '@acx-ui/rc/utils'

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
    model: 'H320'
  }, {
    ledOn: true,
    model: 'H350'
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
    // {
    //   long_name: 'Sunnyvale',
    //   short_name: 'Sunnyvale',
    //   types: [
    //     'locality',
    //     'political'
    //   ]
    // },
    // {
    //   long_name: 'Santa Clara County',
    //   short_name: 'Santa Clara County',
    //   types: [
    //     'administrative_area_level_2',
    //     'political'
    //   ]
    // },
    // {
    //   long_name: 'California',
    //   short_name: 'CA',
    //   types: [
    //     'administrative_area_level_1',
    //     'political'
    //   ]
    // },
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
        id: '3b2ffa31093f41648ed38ed122510029'
      }]
    }
  ]
}

export const venueApsList = { fields: ['meshRole','serialNumber'],totalCount: 0,page: 1,data: [] }