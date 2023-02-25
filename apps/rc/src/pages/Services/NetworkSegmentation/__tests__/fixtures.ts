import { LeaseTimeUnit } from '@acx-ui/rc/utils'

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
  networkIds: ['1', '2']
}