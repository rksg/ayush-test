import { AccessSwitch, DistributionSwitch, LeaseTimeUnit, NewTablePageable } from '@acx-ui/rc/utils'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

export const mockedNsgSwitchInfoData: {
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

export const mockedApList = {
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

export const mockedPersonaList = {
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

export const mockedNsgStatsList = {
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
      vxlanTunnelProfileId: 'test123',
      networkIds: [
        'wlan-1',
        'wlan2'
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
          edgeName: 'Edge1',
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
      vxlanTunnelProfileId: 'test123',
      networkIds: [
        'wlan-1',
        'wlan2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_2',
          venueName: 'MockVenue2',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000002',
          edgeName: 'Edge2',
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

export const mockedNsgData = {
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
export const mockedPersonaGroup = {
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

export const mockedEdgeDhcpDataList = {
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

export const mockedTunnelProfileData = {
  id: 'tunnelProfileId1',
  name: 'tunnelProfile1',
  tag: 'test',
  mtuType: 'MANUAL',
  mtuSize: 1450,
  forceFragmentation: true,
  ageTimeMinutes: 20
}
