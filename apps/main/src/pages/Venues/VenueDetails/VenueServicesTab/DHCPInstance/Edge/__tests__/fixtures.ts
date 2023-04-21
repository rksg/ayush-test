import { LeaseTimeUnit } from '@acx-ui/rc/utils'

export const mockedEdgeList = {
  fields: [
    'name','deviceStatus','type','model','serialNumber','ip',
    'ports','venueName','venueId','tags'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      deviceStatus: '2_00_Operational',
      type: 'type 1',
      model: 'model 1',
      serialNumber: '0000000001',
      ip: '0.0.0.0',
      ports: '80',
      venueName: 'Venue 1',
      venueId: '00001',
      tags: ['Tag1', 'Tag2']
    }
  ]
}

export const mockedDhcpStatsData = {
  fields: [
    'tenantId','id','serviceName','serviceType','dhcpRelay','dhcpPoolNum',
    'edgeNum','venueNum','leaseTime', 'updateAvailable', 'serviceVersion',
    'tags'
  ],
  totalCount: 1,
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
    }
  ]
}

export const mockedEdgeDhcpData = {
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