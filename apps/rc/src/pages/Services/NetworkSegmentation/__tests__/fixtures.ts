import { AccessSwitch, DistributionSwitch, LeaseTimeUnit, NewTablePageable } from '@acx-ui/rc/utils'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

const personaPageable: NewTablePageable = {
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
    { id: '1', name: 'Network 1' , venues: {
      count: 1,
      names: [
        null
      ],
      ids: [
        'testVenueId1'
      ]
    } },
    { id: '2', name: 'Network 2' , venues: {
      count: 0,
      names: [],
      ids: []
    } },
    { id: '3', name: 'Network 3' , venues: {
      count: 0,
      names: [],
      ids: []
    } }
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
    'tags',
    'edgeAlarmSummary'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      name: 'nsg1',
      networkIds: [
        '2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_1',
          venueName: 'MockVenue1',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000001',
          edgeName: 'SmartEdge1',
          segments: 1,
          devices: 1,
          dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
          dhcpPoolId: '1',
          vniRange: ''
        }
      ],
      edgeAlarmSummary: [
        {
          edgeId: '0000000001',
          severitySummary: {
            critical: 1
          },
          totalCount: 1
        }
      ]
    },
    {
      id: '2',
      name: 'nsg2',
      networkIds: [
        '3'
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

export const mockPropertyConfigs = {
  personaGroupId: 'testPersonaId'
}

export const mockPersonaGroup = {
  id: 'testPersonaId',
  name: 'TestPersona',
  personaCount: 2,
  dpskPoolId: 'testDpskId',
  personas: [
    {
      id: 'c677cbb0-8520-421c-99b6-59b3cef5ebc1',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona1'
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      name: 'mock-persona2'
    }
  ]
}

export const mockDpsk = {
  id: 'testDpskId',
  name: 'TestDpsk',
  networkIds: ['1', '2']
}

export const mockApList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'mock-ap',
      apMac: '18:7C:0B:10:29:50',
      serialNumber: '125488555569',
      venueId: 'mock_venue_1',
      model: 'R510',
      apStatusData: { lanPortStatus: [{ port: '0' }, { port: '1' }, { port: '2' }] }
    },
    {
      name: 'mock-ap2',
      apMac: '18:7C:0B:10:29:51',
      serialNumber: '150000000761',
      venueId: 'mock_venue_1',
      model: 'R760',
      apStatusData: { lanPortStatus: [{ port: '0' }] }
    }
  ]
}

export const mockPersonaList = {
  pageable: personaPageable,
  sort: personaPageable.sort,
  totalPages: 1,
  totalElements: 3,
  content: [
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3000,
      devices: null,
      deviceCount: 0,
      ethernetPorts: [],
      switches: null,
      primary: true
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona2',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3001,
      devices: ['AP-1'],
      deviceCount: 1,
      ethernetPorts: [],
      switches: null,
      primary: true
    }
  ]

}

export const mockAvailablePropertyConfigs = {
  content: [
    {
      venueId: 'mock_venue_1',
      venueName: 'Mock Venue 1',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '1dcb4608-af74-46f8-80e8-962f642062d6',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    },
    {
      venueId: 'mock_venue_2',
      venueName: 'Mock Venue 2',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '2c3ef9fe-7e35-4c42-8574-489e07835499',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    },
    {
      venueId: 'mock_venue_3',
      venueName: 'Mock Venue 3',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '2c3ef9fe-7e35-4c42-8574-489e07835499',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    }
  ],
  pageable: {
    sort: {
      unsorted: true,
      sorted: false,
      empty: true
    },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalPages: 1,
  totalElements: 12,
  first: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  numberOfElements: 12,
  size: 20,
  number: 0,
  empty: false
}

export const mockedNetworkOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'networkId1',
      name: 'network1'
    },
    {
      id: 'networkId2',
      name: 'network2'
    }
  ]
}

export const mockedSwitchOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      switchMac: 'c0:c5:20:78:df:32',
      name: 'network1'
    },
    {
      switchMac: 'c0:c5:20:78:df:31',
      name: 'network2'
    }
  ]
}
