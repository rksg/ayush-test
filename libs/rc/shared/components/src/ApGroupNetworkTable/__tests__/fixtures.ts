import { Network, NetworkTypeEnum, VenueApGroup } from '@acx-ui/rc/utils'

export const mockedApGroupNetworkLinks = {
  fields: [
    'clients',
    'isAllApGroups',
    'description',
    'isOweMaster',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'owePairNetworkId',
    'name',
    'cog',
    'vlanPool',
    'id',
    'dsaeOnboardNetwork',
    'nwSubType'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'NewStepForm',
      id: '3cc8f9dc12334e5da69a8f06aef84dc4',
      vlan: 1,
      nwSubType: 'dpsk',
      ssid: 'NewStepForm',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'cap-new',
      id: '70a826008859448592d58482bd38cb88',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'capTemp',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'cap-test2',
      id: 'b4fdbaa607384672a4b6f25a9583407b',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'cap-test2',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'capTemp',
      id: '01c40991df83473eb846d8bdfe14d206',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'Cloudpath',
      ssid: 'capTemp',
      clients: 0,
      isAllApGroups: true
    },
    {
      name: 'ABC',
      id: '0651d1ff199a4bb0b7f8adfeba454154',
      vlan: 1,
      nwSubType: 'psk',
      ssid: 'ABC',
      clients: 0,
      isAllApGroups: true
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'vlan'
      ],
      url: '/api/tenant/fe8d6c89c852473ea343c9a0fa66829b/wifi/network/get/deep',
      httpMethod: 'POST',
      payload: [
        '3cc8f9dc12334e5da69a8f06aef84dc4',
        '70a826008859448592d58482bd38cb88',
        'b4fdbaa607384672a4b6f25a9583407b',
        '01c40991df83473eb846d8bdfe14d206',
        '0651d1ff199a4bb0b7f8adfeba454154'
      ]
    }
  ]
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

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN },
    { name: 'NewStepForm', id: '3cc8f9dc12334e5da69a8f06aef84dc4', type: NetworkTypeEnum.DPSK },
    { name: 'cap-new', id: '70a826008859448592d58482bd38cb88', type: NetworkTypeEnum.OPEN },
    { name: 'cap-test2', id: 'b4fdbaa607384672a4b6f25a9583407b', type: NetworkTypeEnum.OPEN },
    { name: 'capTemp', id: '01c40991df83473eb846d8bdfe14d206', type: NetworkTypeEnum.PSK },
    { name: 'ABC', id: '0651d1ff199a4bb0b7f8adfeba454154', type: NetworkTypeEnum.PSK }
  ]
}

export const mockTableResult = {
  totalCount: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Client Isolation 1',
    vlanMembers: ['1'],
    venueApGroups: [{
      id: '1',
      apGroups: [{
        id: '00d4a19ee93f49369ad90815c917c671',
        allApGroups: true,
        default: true
      }]
    }, {
      id: '2',
      apGroups: [{
        id: '07905d867d9b416183fe4d48d5cf391e',
        allApGroups: true,
        default: true
      }]
    }, {
      id: '3',
      apGroups: [{
        id: 'b9eb6106a4d44ac498f1aa89a8fb87d5',
        allApGroups: false,
        default: true
      }]
    }],
    venueIds: ['1','2','3']
  }]
}

export const apGroupNetworkTableData = [
  {
    name: 'nw-temp',
    id: '0be9ea6fb0cd47b3add309ec2f84b153',
    vlan: 1,
    nwSubType: 'psk',
    ssid: 'nw-temp',
    clientCount: 0,
    venueApGroups: [
      {
        venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
        apGroupIds: [
          'fb99f472c7d345e7828cbcf8c67e8d8e'
        ],
        isAllApGroups: false
      }
    ],
    clients: 0,
    activated: {
      isActivated: true,
      isDisabled: false,
      errors: []
    },
    deepNetwork: {
      type: 'psk',
      wlan: {
        wlanSecurity: 'WPA2Personal',
        advancedCustomization: {
          enableAaaVlanOverride: true,
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
          enableAdditionalRegulatoryDomains: true,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'NONE',
            managementFrameMinimumPhyRate: '6'
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          respectiveAccessControl: true,
          radiusOptions: {
            nasIdType: 'BSSID',
            nasIdDelimiter: 'DASH',
            nasRequestTimeoutSec: 3,
            nasMaxRetry: 2,
            nasReconnectPrimaryMin: 5,
            calledStationIdType: 'BSSID',
            singleSessionIdAccounting: false
          },
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
          bssPriority: 'HIGH',
          enableGtkRekey: true,
          enableApHostNameAdvertisement: false,
          dhcpOption82Enabled: false,
          dhcpOption82SubOption1Enabled: false,
          dhcpOption82SubOption2Enabled: false,
          dhcpOption82SubOption150Enabled: false,
          dhcpOption82SubOption151Enabled: false,
          dhcpOption82MacFormat: 'COLON',
          agileMultibandEnabled: false,
          dtimInterval: 1,
          wifi6Enabled: true,
          wifi7Enabled: true,
          multiLinkOperationEnabled: false,
          multiLinkOperationOptions: {
            enable24G: true,
            enable50G: true,
            enable6G: true
          },
          enableMulticastUplinkRateLimiting: false,
          multicastUplinkRateLimiting: 1,
          enableMulticastDownlinkRateLimiting: false,
          multicastDownlinkRateLimiting: 1,
          enableMulticastUplinkRateLimiting6G: false,
          enableMulticastDownlinkRateLimiting6G: false,
          multicastFilterEnabled: false,
          qosMirroringEnabled: true,
          qosMirroringScope: 'MSCS_REQUESTS_ONLY',
          qosMapSetEnabled: false,
          qosMapSetOptions: {},
          centralizedForwardingEnabled: false,
          fastRoamingOptions: {
            statisticsOverDistributedSystemEnabled: false,
            reassociationTimeout: 20
          },
          applicationVisibilityEnabled: true
        },
        macAddressAuthentication: false,
        managementFrameProtection: 'Disabled',
        vlanId: 1,
        ssid: 'nw-temp',
        enabled: true,
        passphrase: 'asdfasdfasdf'
      },
      name: 'nw-temp',
      isEnforced: false,
      id: '0be9ea6fb0cd47b3add309ec2f84b153',
      venues: [
        {
          dual5gEnabled: false,
          tripleBandEnabled: false,
          allApGroupsRadio: 'Both',
          isAllApGroups: false,
          allApGroupsRadioTypes: [
            '2.4-GHz',
            '5-GHz'
          ],
          isEnforced: false,
          networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
          apGroups: [
            {
              radioTypes: [
                '2.4-GHz',
                '5-GHz'
              ],
              apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
              venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
              networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
              radio: 'Both',
              isDefault: false,
              apGroupName: 'apg'
            }
          ],
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
        }
      ]
    },
    incompatible: 0,
    deepVenue: {
      dual5gEnabled: false,
      tripleBandEnabled: false,
      allApGroupsRadio: 'Both',
      isAllApGroups: false,
      allApGroupsRadioTypes: [
        '2.4-GHz',
        '5-GHz'
      ],
      isEnforced: false,
      networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
      apGroups: [
        {
          radioTypes: [
            '2.4-GHz',
            '5-GHz'
          ],
          apGroupId: 'fb99f472c7d345e7828cbcf8c67e8d8e',
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
          networkId: '0be9ea6fb0cd47b3add309ec2f84b153',
          radio: 'Both',
          isDefault: false,
          apGroupName: 'apg'
        }
      ],
      venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
    }
  },
  {
    name: 'nw-temp-1',
    id: '316b945113ff45b189c23e0a7f29a8f7',
    vlan: 1,
    nwSubType: 'psk',
    ssid: 'nw-temp-1',
    venueApGroups: [
      {
        venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096',
        apGroupIds: [
          'b20e1a26eec44146b2687417ef5d7f0b',
          'fb99f472c7d345e7828cbcf8c67e8d8e',
          'bb16a3c5c79e4cb8a75fc25dc11f7a2e'
        ],
        isAllApGroups: true
      }
    ] as VenueApGroup[],
    clients: 0,
    activated: {
      isActivated: true,
      isDisabled: false,
      errors: []
    },
    deepNetwork: {
      type: 'psk',
      wlan: {
        wlanSecurity: 'WPA2Personal',
        advancedCustomization: {
          enableAaaVlanOverride: true,
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
          enableAdditionalRegulatoryDomains: true,
          mobilityDomainId: 1,
          radioCustomization: {
            rfBandUsage: 'BOTH',
            bssMinimumPhyRate: 'default',
            phyTypeConstraint: 'NONE',
            managementFrameMinimumPhyRate: '6'
          },
          enableSyslog: false,
          clientInactivityTimeout: 120,
          respectiveAccessControl: true,
          radiusOptions: {
            nasIdType: 'BSSID',
            nasIdDelimiter: 'DASH',
            nasRequestTimeoutSec: 3,
            nasMaxRetry: 2,
            nasReconnectPrimaryMin: 5,
            calledStationIdType: 'BSSID',
            singleSessionIdAccounting: false
          },
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
          bssPriority: 'HIGH',
          enableGtkRekey: true,
          enableApHostNameAdvertisement: false,
          dhcpOption82Enabled: false,
          dhcpOption82SubOption1Enabled: false,
          dhcpOption82SubOption2Enabled: false,
          dhcpOption82SubOption150Enabled: false,
          dhcpOption82SubOption151Enabled: false,
          dhcpOption82MacFormat: 'COLON',
          agileMultibandEnabled: false,
          dtimInterval: 1,
          wifi6Enabled: true,
          wifi7Enabled: true,
          multiLinkOperationEnabled: false,
          multiLinkOperationOptions: {
            enable24G: true,
            enable50G: true,
            enable6G: true
          },
          enableMulticastUplinkRateLimiting: false,
          multicastUplinkRateLimiting: 1,
          enableMulticastDownlinkRateLimiting: false,
          multicastDownlinkRateLimiting: 1,
          enableMulticastUplinkRateLimiting6G: false,
          enableMulticastDownlinkRateLimiting6G: false,
          multicastFilterEnabled: false,
          qosMirroringEnabled: true,
          qosMirroringScope: 'MSCS_REQUESTS_ONLY',
          qosMapSetEnabled: false,
          qosMapSetOptions: {},
          centralizedForwardingEnabled: false,
          fastRoamingOptions: {
            statisticsOverDistributedSystemEnabled: false,
            reassociationTimeout: 20
          },
          applicationVisibilityEnabled: true
        },
        macAddressAuthentication: false,
        managementFrameProtection: 'Disabled',
        vlanId: 1,
        ssid: 'nw-temp-1',
        enabled: true,
        passphrase: 'asdfasdfasdfasdfasdf'
      },
      name: 'nw-temp-1',
      isEnforced: false,
      id: '316b945113ff45b189c23e0a7f29a8f7',
      venues: [
        {
          dual5gEnabled: false,
          tripleBandEnabled: false,
          allApGroupsRadio: 'Both',
          isAllApGroups: true,
          allApGroupsRadioTypes: [
            '2.4-GHz',
            '5-GHz'
          ],
          isEnforced: false,
          networkId: '316b945113ff45b189c23e0a7f29a8f7',
          apGroups: [],
          venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
        }
      ]
    },
    incompatible: 0,
    deepVenue: {
      dual5gEnabled: false,
      tripleBandEnabled: false,
      allApGroupsRadio: 'Both',
      isAllApGroups: true,
      allApGroupsRadioTypes: [
        '2.4-GHz',
        '5-GHz'
      ],
      isEnforced: false,
      networkId: '316b945113ff45b189c23e0a7f29a8f7',
      apGroups: [],
      venueId: '29d3d0a0d45f49a4a3ecb2592bcd6096'
    }
  }
] as unknown as Network[]
