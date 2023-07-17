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