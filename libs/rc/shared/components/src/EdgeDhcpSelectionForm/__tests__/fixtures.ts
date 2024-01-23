export const mockEdgeDhcpList = {
  content: [
    {
      id: '1',
      serviceName: 'Mock DHCP service',
      dhcpRelay: false,
      externalDhcpServerFqdnIp: '1.1.1.1',
      domainName: '',
      primaryDnsIp: '',
      secondaryDnsIp: '',
      leaseTime: 25,
      leaseTimeType: 'Limited',  // UI used
      leaseTimeUnit: 'HOURS',
      usedForNSG: true,
      dhcpPools: [{
        id: '1',
        poolName: 'RelayOffPoolTest1',
        subnetMask: '255.255.255.0',
        poolStartIp: '1.1.1.1',
        poolEndIp: '1.1.1.10',
        gatewayIp: '1.1.1.120',
        activated: true
      }],
      dhcpOptions: [],
      hosts: []
    }
  ]
}