import { LeaseTimeUnit } from '@acx-ui/rc/utils'

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
      hostRemainingTime: 124416000,
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
    },
    {
      hostName: 'TestHost2',
      dhcpPoolName: 'pool2',
      hostIpAddr: '22.22.22.1',
      hostMac: '00:0c:29:26:dd:20',
      hostStatus: 'OFFLINE',
      hostExpireDate: '2023-04-07 10:39:36',
      hostRemainingTime: 124416001,
      edgeId: '96B341ADD6C16C11ED8B8B000C296600F2'
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