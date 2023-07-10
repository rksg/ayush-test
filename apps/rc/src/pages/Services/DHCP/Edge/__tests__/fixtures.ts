import { LeaseTimeUnit } from '@acx-ui/rc/utils'

export const mockEdgeDhcpData = {
  id: '1',
  serviceName: 'test',
  dhcpRelay: true,
  externalDhcpServerFqdnIp: '1.1.1.1',
  domainName: 'test.com.cc',
  primaryDnsIp: '1.1.1.1',
  secondaryDnsIp: '2.2.2.2',
  leaseTime: 24,
  leaseTimeUnit: LeaseTimeUnit.HOURS,
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

export const mockDhcpPoolStatsData = {
  fields: [
    'tenantId','id','edgeIds','dhcpId','poolName','subnetMask',
    'poolRange','gateway','activated'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '1',
      edgeIds: ['1'],
      dhcpId: '1',
      poolName: 'TestPool1',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '2',
      edgeIds: ['2', '3'],
      dhcpId: '2',
      poolName: 'TestPool2',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '3',
      edgeIds: ['4'],
      dhcpId: '3',
      poolName: 'TestPool3',
      subnetMask: '255.255.255.0',
      poolRange: '1.1.1.1 - 1.1.1.5',
      gateway: '1.2.3.4',
      activated: 'true'
    }
  ]
}

export const mockDhcpStatsData = {
  fields: [
    'tenantId','id','serviceName','serviceType','dhcpRelay','dhcpPoolNum',
    'edgeNum','venueNum','leaseTime', 'currentVersion', 'targetVersion',
    'tags'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '1',
      serviceName: 'TestDHCP-1',
      serviceType: 'DHCP',
      dhcpRelay: 'true',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      currentVersion: '1.0.1',
      targetVersion: '1.0.2',
      tags: ['Tag1']
    },
    {
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '2',
      serviceName: 'TestDHCP-2',
      serviceType: 'DHCP',
      dhcpRelay: 'false',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      currentVersion: '1.0.1, 1.0.2',
      targetVersion: '1.0.2',
      tags: ['Tag1']
    },{
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '3',
      serviceName: 'TestDHCP-3',
      serviceType: 'DHCP',
      dhcpRelay: 'false',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      currentVersion: '1.0.2',
      targetVersion: '1.0.2',
      tags: ['Tag1']
    },{
      tenantId: '1ecc2d7cf9d2342fdb31ae0e24958fcac',
      id: '4',
      serviceName: 'TestDHCP-4',
      serviceType: 'DHCP',
      dhcpRelay: 'false',
      dhcpPoolNum: 3,
      edgeNum: 3,
      venueNum: 3,
      leaseTime: '24 hours',
      health: 'Good',
      targetVersion: '1.0.2',
      tags: ['Tag1']
    }
  ]
}

export const mockDhcpUeSummaryStatsData = {
  fields: [
    'edgeId',
    'edgeName',
    'venueId',
    'venueName',
    'successfulAllocation',
    'remainsIps',
    'droppedPackets'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      edgeId: '1',
      dhcpId: '1',
      edgeName: 'Edge-dhcp-1',
      venueId: '1',
      venueName: 'Edge-venue-1',
      successfulAllocation: 7,
      remainsIps: 151,
      droppedPackets: 0
    },
    {
      edgeId: '2',
      dhcpId: '1',
      edgeName: 'Edge-dhcp-2',
      venueId: '2',
      venueName: 'Edge-venue-2',
      successfulAllocation: 1,
      remainsIps: 151,
      droppedPackets: 0
    }
  ]
}