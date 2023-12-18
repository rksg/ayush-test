import { LeaseTimeUnit } from '../../../../models/EdgeDhcpEnum'

export const mockEdgeDhcpHostStats = {
  fields: null,
  totalCount: 2,
  page: 1,
  data: [
    {
      hostName: 'TestHost1',
      dhcpPoolName: 'pool1',
      hostIpAddr: '22.22.22.3',
      hostMac: '00:0c:29:26:dd:24',
      hostStatus: 'ONLINE',
      hostExpireDate: '2023-04-07 10:39:36',
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
    },
    {
      hostName: 'TestHost2',
      dhcpPoolName: 'pool2',
      hostIpAddr: '22.22.22.1',
      hostMac: '00:0c:29:26:dd:20',
      hostStatus: 'OFFLINE',
      hostExpireDate: '2023-04-07 10:39:36',
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
    }
  ]
}

export const mockDhcpStatsData = {
  fields: [
    'tenantId','id','serviceName','serviceType','dhcpRelay','dhcpPoolNum',
    'edgeNum','venueNum','leaseTime', 'updateAvailable', 'serviceVersion',
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
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
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
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
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
      updateAvailable: 'NO',
      serviceVersion: '0.0.1',
      tags: ['Tag1']
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
