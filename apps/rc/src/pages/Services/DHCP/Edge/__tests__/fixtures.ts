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