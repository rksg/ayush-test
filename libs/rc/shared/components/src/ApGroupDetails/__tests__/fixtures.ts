import {
  NetworkTypeEnum,
  RadioEnum,
  RadioTypeEnum,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

export const oneApGroupList = {
  data: [{
    id: '58195e050b8a4770acc320f6233ad8d9',
    name: 'joe-test-apg',
    members: { count: 1, names: ['T750SE'] },
    networks: { count: 1, names: ['joe-psk'] },
    venueId: '991eb992ece042a183b6945a2398ddb9',
    venueName: 'joe-test'
  }],
  fields: ['venueName', 'venueId', 'members', 'name', 'id', 'networks'],
  page: 1,
  totalCount: 1
}

export const apGroupMembers = {
  data: [{
    deviceGroupId: '58195e050b8a4770acc320f6233ad8d9',
    deviceGroupName: 'joe-test-apg',
    deviceStatus: '1_09_Offline',
    fwVersion: '7.0.0.103.390',
    healthStatus: 'Poor',
    name: 'T750SE',
    serialNumber: '922102004888'
  }],
  fields: [
    'serialNumber',
    'deviceGroupId',
    'name',
    'deviceGroupName',
    'fwVersion',
    'id',
    'deviceStatus'
  ],
  page: 1,
  totalCount: 1
}

export const apGroupNetworkLinks = {
  data: [{
    clients: 0,
    id: '3c83529e839746ae960fa8fb6d4fd387',
    name: 'joe-psk',
    nwSubType: 'psk',
    ssid: 'joe-psk',
    vlan: 1
  }],
  page: 1,
  totalCount: 1
}

export const networkApGroup = {
  response: [{
    allApGroupsRadio: 'Both',
    apGroups: [{
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      apGroupName: 'joe-test-apg',
      id: 'f71c3dc400bb46e5a03662d48d0adb2c',
      isDefault: false,
      radio: 'Both',
      radioTypes: ['5-GHz', '2.4-GHz'],
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false,
      vlanPoolId: '545c8f5dd44f45c2b47f19f8db4f53dc',
      vlanPoolName: 'joe-vlanpool-1'
    }, {
      apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
      isDefault: true,
      radio: 'Both',
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false
    }],
    dual5gEnabled: false,
    isAllApGroups: false,
    networkId: '3c83529e839746ae960fa8fb6d4fd387',
    tripleBandEnabled: true,
    venueId: '991eb992ece042a183b6945a2398ddb9'
  }]
}

export const networkDeepList = {
  response: [{
    id: '3c83529e839746ae960fa8fb6d4fd387',
    name: 'joe-psk',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: 'psk',
    venues: [{
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: 'f71c3dc400bb46e5a03662d48d0adb2c',
        isDefault: false,
        radio: 'Both',
        radioTypes: ['5-GHz', '2.4-GHz'],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        vlanPoolId: '545c8f5dd44f45c2b47f19f8db4f53dc',
        vlanPoolName: 'joe-vlanpool-1'
      }, {
        apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
        isDefault: true,
        radio: 'Both',
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '54421058eb4c46f18cc30c9abc945510',
      isAllApGroups: false,
      networkId: '3c83529e839746ae960fa8fb6d4fd387',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      advancedCustomization: {
        accessControlEnable: false,
        agileMultibandEnabled: false,
        applicationPolicyEnable: false,
        arpRequestRateLimit: 15,
        broadcastProbeResponseDelay: 15,
        bssPriority: 'HIGH',
        centralizedForwardingEnabled: false,
        clientInactivityTimeout: 120,
        clientIsolation: false,
        clientIsolationOptions: { autoVrrp: false },
        clientLoadBalancingEnable: true,
        dhcpOption82Enabled: false,
        dhcpOption82MacFormat: 'COLON',
        dhcpOption82SubOption1Enabled: false,
        dhcpOption82SubOption2Enabled: false,
        dhcpOption82SubOption150Enabled: false,
        dhcpOption82SubOption151Enabled: false,
        dhcpRequestRateLimit: 15,
        directedThreshold: 5,
        dnsProxyEnabled: false,
        dtimInterval: 1,
        enableAdditionalRegulatoryDomains: true,
        enableAirtimeDecongestion: false,
        enableAntiSpoofing: false,
        enableApHostNameAdvertisement: false,
        enableArpRequestRateLimit: true,
        enableBandBalancing: true,
        enableDhcpRequestRateLimit: true,
        enableFastRoaming: false,
        enableGtkRekey: true,
        enableJoinRSSIThreshold: false,
        enableMulticastDownlinkRateLimiting: false,
        enableMulticastDownlinkRateLimiting6G: false,
        enableMulticastUplinkRateLimiting: false,
        enableMulticastUplinkRateLimiting6G: false,
        enableNeighborReport: true,
        enableOptimizedConnectivityExperience: false,
        enableSyslog: false,
        enableTransientClientManagement: false,
        forceMobileDeviceDhcp: false,
        hideSsid: false,
        joinExpireTime: 300,
        joinRSSIThreshold: -85,
        joinWaitThreshold: 10,
        joinWaitTime: 30,
        l2AclEnable: false,
        l3AclEnable: false,
        maxClientsOnWlanPerRadio: 100,
        mobilityDomainId: 1,
        multiLinkOperationEnabled: false,
        multiLinkOperationOptions: {
          enable24G: true,
          enable50G: true,
          enable6G: false
        },
        multicastDownlinkRateLimiting: 1,
        multicastFilterEnabled: false,
        multicastUplinkRateLimiting: 1,
        proxyARP: false,
        qosMapSetEnabled: false,
        qosMapSetOptions: {},
        qosMirroringEnabled: false,
        qosMirroringScope: 'MSCS_REQUESTS_ONLY',
        radioCustomization: {
          bssMinimumPhyRate: 'default',
          managementFrameMinimumPhyRate: '6',
          phyTypeConstraint: 'OFDM',
          rfBandUsage: 'BOTH'
        },
        radiusOptions: {
          calledStationIdType: 'BSSID',
          nasIdDelimiter: 'DASH',
          nasIdType: 'BSSID',
          nasMaxRetry: 2,
          nasReconnectPrimaryMin: 5,
          nasRequestTimeoutSec: 3,
          singleSessionIdAccounting: false
        },
        respectiveAccessControl: true,
        rssiAssociationRejectionThreshold: -75,
        totalDownlinkRateLimiting: 0,
        totalUplinkRateLimiting: 0,
        userDownlinkRateLimiting: 0,
        userUplinkRateLimiting: 0,
        wifi6Enabled: true,
        wifi7Enabled: true,
        wifiCallingEnabled: false
      },
      enabled: true,
      macAddressAuthentication: false,
      managementFrameProtection: 'Optional',
      passphrase: 'xxxxxxxxx',
      saePassphrase: 'xxxxxxxx',
      ssid: 'joe-psk',
      vlanId: 1,
      wlanSecurity: 'WPA23Mixed'
    }
  }]
}

export const vlanPoolList = [
  {
    id: 'e6842cfcf2e9423e9453dd4de84b29b3',
    name: 'joe-vlanpool-2',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    vlanMembers: ['20-30']
  }, {
    id: '545c8f5dd44f45c2b47f19f8db4f53dc',
    name: 'joe-vlanpool-1',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    vlanMembers: ['2-10']
  }
]

export const ApGroupNetworkTableData = [{
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    authRadius: {
      id: '140081aef2344707aaa6fbc6c795ce85',
      name: 'testRadius',
      primary: {
        ip: '1.1.1.1',
        port: 1812,
        sharedSecret: '12345678'
      },
      type: 'AUTHENTICATION'
    },
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: '27065090e000493396f9e044ea3eb207',
    name: 'joe-aaa',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.AAA,
    venues: [{
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '1de56a9c55e44291a9be7eb20e555299',
        isDefault: false,
        radio: RadioEnum.Both,
        radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        vlanId: 10
      }],
      dual5gEnabled: false,
      id: 'b1d329d47ef1436d8f9025af99854c3f',
      isAllApGroups: false,
      networkId: '27065090e000493396f9e044ea3eb207',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      managementFrameProtection: 'Disabled',
      ssid: 'joe-aaa',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.WPA2Enterprise
    }
  },
  id: '27065090e000493396f9e044ea3eb207',
  description: '',
  isAllApGroups: false,
  name: 'joe-aaa',
  nwSubType: 'aaa',
  ssid: 'joe-aaa',
  vlan: 10
}, {
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: 'd27ac21dba624ec2a1bc21e154b09a63',
    isOweMaster: false,
    name: 'joe-open',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.OPEN,
    venues: [{
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '19c1b37510f649a4beeb88569eacbc5c',
        isDefault: false,
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '4aa21b1f0381415ab39809f045681332',
      isAllApGroups: false,
      networkId: 'd27ac21dba624ec2a1bc21e154b09a63',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      macAddressAuthentication: false,
      ssid: 'joe-open',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.Open
    }
  },
  id: 'd27ac21dba624ec2a1bc21e154b09a63',
  description: '',
  isAllApGroups: false,
  isOweMaster: false,
  name: 'joe-open',
  nwSubType: 'open',
  ssid: 'joe-open',
  vlan: 1
}]

export const vlanPoolProfilesData = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '159b156f559749fcb0d8bbfe76a54934',
      name: 'pool1'
    }
  ]
}
