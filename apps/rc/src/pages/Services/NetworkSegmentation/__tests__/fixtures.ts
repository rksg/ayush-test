import { AccessSwitch, DistributionSwitch, LeaseTimeUnit } from '@acx-ui/rc/utils'

export const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
  ]
}

export const mockEdgeData = {
  fields: [
    'name', 'serialNumber'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      serialNumber: '0000000001'
    },
    {
      name: 'Smart Edge 2',
      serialNumber: '0000000002'
    },
    {
      name: 'Smart Edge 3',
      serialNumber: '0000000003'
    }
  ]
}

export const mockEdgeDhcpDataList = {
  page: 1,
  pageSize: 10,
  totalCount: 2,
  content: [
    {
      id: '1',
      serviceName: 'TestDhcp-1',
      dhcpRelay: true,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: 'test.com.cc',
      primaryDnsIp: '1.1.1.1',
      secondaryDnsIp: '2.2.2.2',
      leaseTime: 24,
      leaseTimeUnit: LeaseTimeUnit.HOURS,
      edgeIds: [],
      dhcpPools: [
        {
          id: '1',
          poolName: 'PoolTest1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.10',
          gatewayIp: '1.1.1.1',
          activated: true
        }
      ],
      hosts: [
        {
          id: '1',
          hostName: 'HostTest1',
          mac: '00:0c:29:26:dd:fc',
          fixedAddress: '1.1.1.1'
        }
      ]
    },
    {
      id: '2',
      serviceName: 'TestDhcp-2',
      dhcpRelay: true,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: 'test.com.cc',
      primaryDnsIp: '1.1.1.1',
      secondaryDnsIp: '2.2.2.2',
      leaseTime: 24,
      leaseTimeUnit: LeaseTimeUnit.HOURS,
      edgeIds: [],
      dhcpPools: [
        {
          id: '1',
          poolName: 'PoolTest1',
          subnetMask: '255.255.255.0',
          poolStartIp: '1.1.1.1',
          poolEndIp: '1.1.1.10',
          gatewayIp: '1.1.1.1',
          activated: true
        }
      ],
      hosts: [
        {
          id: '1',
          hostName: 'HostTest1',
          mac: '00:0c:29:26:dd:fc',
          fixedAddress: '1.1.1.1'
        }
      ]
    }
  ]
}

export const mockVenueNetworkData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: '1', name: 'Network 1' },
    { id: '2', name: 'Network 2' },
    { id: '3', name: 'Network 3' }
  ]
}

export const mockNetworkGroup = {
  requestId: '1234',
  response: [
    { networkId: '1' },
    { networkId: '2' },
    { networkId: '3' }
  ]
}

export const mockNsgStatsList = {
  fields: [
    'venueInfos',
    'edgeInfos',
    'networkIds',
    'name',
    'id',
    'tags'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      name: 'nsg1',
      networkIds: [
        'wlan-1',
        'wlan2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_1',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000001',
          segments: 10,
          devices: 10,
          dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
          dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
          vniRange: ''
        }
      ]
    },
    {
      id: '2',
      name: 'nsg2',
      networkIds: [
        'wlan-1',
        'wlan2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_2',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000002',
          segments: 10,
          devices: 10,
          dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
          dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
          vniRange: ''
        }
      ]
    }
  ]
}

export const mockNsgData = {
  id: '2599f95d-86a2-470c-9679-e739de054ba1',
  name: 'RLTestNsg-1',
  vxlanTunnelProfileId: 'test123',
  venueInfos: [
    {
      venueId: 'mock_venue_1',
      personaId: ''
    }
  ],
  edgeInfos: [
    {
      edgeId: '0000000001',
      segments: 10,
      devices: 10,
      dhcpInfoId: '1',
      dhcpPoolId: '1'
    }
  ],
  networkIds: ['1', '2'],
  distributionSwitchInfos: [
    {
      id: 'c8:03:f5:3a:95:c6',
      siteName: '964fe8920291194e208b6d22370c2cc82c',
      loopbackInterfaceId: '12',
      loopbackInterfaceIp: '1.2.3.4',
      loopbackInterfaceSubnetMask: '255.255.255.0',
      vlans: '23',
      siteKeepAlive: '5',
      siteRetry: '3'
    }
  ],
  accessSwitchInfos: [
    {
      id: 'c0:c5:20:aa:35:fd',
      templateId: '723250a97f3a4c3780e70c83c5b095ba',
      webAuthPageType: 'TEMPLATE',
      vlanId: '111',
      webAuthPasswordLabel: 'password-Ken-0209',
      webAuthCustomTitle: 'title-Ken-0209',
      webAuthCustomTop: 'top-Ken-0209',
      webAuthCustomLoginButton: 'login-Ken-0209',
      webAuthCustomBottom: 'bottom-Ken-0209'
    }
  ]
}

export const mockNsgSwitchInfoData: {
  distributionSwitches: DistributionSwitch[],
  accessSwitches: AccessSwitch[]
} = {
  distributionSwitches: [{
    id: 'c8:03:f5:3a:95:c6',
    siteName: '964fe8920291194e208b6d22370c2cc82c',
    siteIp: '10.206.78.150',
    vlans: '23',
    siteKeepAlive: '5',
    siteRetry: '3',
    loopbackInterfaceId: '12',
    loopbackInterfaceIp: '1.2.3.4',
    loopbackInterfaceSubnetMask: '255.255.255.0',
    forwardingProfile: '2',
    siteConnection: 'Disconnected',
    siteActive: '10.206.78.150',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7550-48P',
    name: 'FMN4221R00H---DS---3',
    familyId: 'ICX7550',
    firmwareVersion: 'GZR09010f_b40.bin'
  }],
  accessSwitches: [{
    id: 'c0:c5:20:aa:35:fd',
    vlanId: 111,
    webAuthPageType: 'TEMPLATE',
    templateId: '723250a97f3a4c3780e70c83c5b095ba',
    webAuthPasswordLabel: 'password-Ken-0209',
    webAuthCustomTitle: 'title-Ken-0209',
    webAuthCustomTop: 'top-Ken-0209',
    webAuthCustomLoginButton: 'login-Ken-0209',
    webAuthCustomBottom: 'bottom-Ken-0209',
    uplinkInfo: {
      uplinkType: 'PORT',
      uplinkId: '1/1/1'
    },
    distributionSwitchId: 'c8:03:f5:3a:95:c6',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7150-C12P',
    name: 'FEK3224R09N---AS---3',
    familyId: 'ICX7150',
    firmwareVersion: 'SPR09010f_b32.bin'
  }]
}

export const webAuthList = [{
  id: '723250a97f3a4c3780e70c83c5b095ba',
  name: 'Template-Ken-0209',
  webAuthPasswordLabel: 'password-Ken-0209',
  webAuthCustomTitle: 'title-Ken-0209',
  webAuthCustomTop: 'top-Ken-0209',
  webAuthCustomLoginButton: 'login-Ken-0209',
  webAuthCustomBottom: 'bottom-Ken-0209'
}]

export const switchPortList = [{
  portIdentifier: '1/1/1',
  lagId: '0'
}, {
  portIdentifier: '1/1/2',
  lagId: '0'
}, {
  portIdentifier: '1/1/3',
  lagId: '1'
}]

export const switchLagList = [
  {
    id: 'b343a5a0f88d4a878a070aadc5363538',
    lagId: 1,
    name: 'test-lag',
    ports: ['1/1/3'],
    realRemove: true,
    switchId: 'c0:c5:20:aa:35:fd',
    taggedVlans: [ '2', '3'],
    type: 'static',
    untaggedVlan: '1'
  }
]

export const switchVlanUnion = {
  switchDefaultVlan: [
    {
      switchId: 'c0:c5:20:aa:35:fd',
      vlanConfigName: 'DEFAULT-VLAN',
      profileLevel: false,
      defaultVlan: true,
      vlanId: 1
    }
  ],
  switchVlan: [
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 2
    },
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 3
    },
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 4
    }
  ]
}

