export const mockedHostData = [
  {
    id: '1',
    hostName: 'TestHost-1',
    mac: '11:11:11:11',
    fixedAddress: '1.1.1.1'
  },
  {
    id: '2',
    hostName: 'TestHost-2',
    mac: '11:11:11:12',
    fixedAddress: '1.1.1.2'
  }
]

export const mockedPoolData = [
  {
    id: '1',
    poolName: 'TestPool-1',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.5',
    gatewayIp: '1.1.1.0',
    activated: true
  },
  {
    id: '2',
    poolName: 'TestPool-2',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.5',
    gatewayIp: '1.1.1.0',
    activated: true
  }
]

export const mockedOptionData = [
  {
    id: '1',
    optionId: '6',
    optionName: 'Domain Server',
    optionValue: '1.1.1.1'
  },
  {
    id: '2',
    optionId: '15',
    optionName: 'Domain name',
    optionValue: '34'
  }
]

export const mockEdgeDhcpDataRelayOn = {
  id: '1',
  serviceName: 'test',
  dhcpRelay: true,
  externalDhcpServerFqdnIp: '1.1.1.1',
  domainName: '',
  primaryDnsIp: '',
  secondaryDnsIp: '',
  leaseTime: -1,
  leaseTimeType: 'Infinite',  // UI used
  leaseTimeUnit: 'HOURS',
  forNSG: true,
  dhcpPools: [{
    id: '1',
    poolName: 'PoolTest1',
    subnetMask: '255.255.255.0',
    poolStartIp: '1.1.1.1',
    poolEndIp: '1.1.1.10',
    gatewayIp: '',
    activated: true
  }],
  dhcpOptions: [],
  hosts: []
}

export const mockEdgeDhcpDataRelayOff = {
  id: '1',
  serviceName: 'testRelayOff',
  dhcpRelay: false,
  externalDhcpServerFqdnIp: '1.1.1.1',
  domainName: '',
  primaryDnsIp: '',
  secondaryDnsIp: '',
  leaseTime: 25,
  leaseTimeType: 'Limited',  // UI used
  leaseTimeUnit: 'HOURS',
  forNSG: true,
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