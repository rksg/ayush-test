export const successResponse = { requestId: 'request-id' }

export const routedList = {
  data: [
    {
      defaultVlan: false,
      deviceStatus: 'ONLINE',
      dhcpRelayAgent: '1.1.1.1',
      egressAclName: '14',
      id: '330870e4318f431b8559ce8772901c1e',
      ingressAclName: '12',
      ipAddress: '3.3.3.3',
      ipSubnetMask: '255.255.255.0',
      name: 'TEST-VE3',
      ospfArea: '234',
      portType: 'VE',
      stack: true,
      switchId: '58:fb:96:0e:82:8a',
      switchName: '7150stack',
      syncedSwitchConfig: true,
      veId: 3,
      vlanId: 3
    },
    {
      defaultVlan: false,
      deviceStatus: 'ONLINE',
      id: 'e0f64874e6cb4cc7aa13ac6c6d48ffe9',
      ipAddress: '2.2.2.2',
      ipSubnetMask: '255.255.255.0',
      portType: 'VE',
      stack: true,
      switchId: '58:fb:96:0e:82:8a',
      switchName: '7150stack',
      syncedSwitchConfig: true,
      veId: 2,
      vlanId: 2
    },
    {
      defaultVlan: true,
      deviceStatus: 'ONLINE',
      id: 'f064570d8dbc4329a69dd6df53fffdc6',
      ipAddress: '10.206.10.37',
      ipAddressType: 'dynamic',
      ipSubnetMask: '255.255.254.0',
      name: '2d',
      portType: 'VE',
      stack: true,
      switchId: '58:fb:96:0e:82:8a',
      switchName: '7150stack',
      syncedSwitchConfig: true,
      veId: 1,
      vlanId: 1
    }
  ],
  fields: [
    'portNumber',
    'id',
    'switchId',
    'clientVlan',
    'venueId',
    'deviceStatus',
    'veId',
    'syncedSwitchConfig',
    'defaultVlan',
    'check-all',
    'veId',
    'vlanId',
    'name',
    'portType',
    'switchName',
    'ipAddress',
    'ipSubnetMask',
    'ingressAclName',
    'egressAclName',
    'cog'
  ],
  page: 1,
  totalCount: 3,
  totalPages: 1
}

export const aclList = {
  profileAcl: [
    '17',
    '18',
    '3',
    '5',
    '2',
    '1',
    '4',
    '12',
    '16',
    '6',
    'all',
    '8',
    '7',
    '9',
    '19',
    '13',
    '14',
    '20',
    '15',
    'ee',
    'extended',
    '22',
    '11',
    '33'
  ],
  switchAcl: [
    'test1',
    'test acl'
  ]
}

export const switchList = {
  defaultGateway: '10.206.11.254',
  dhcpClientEnabled: true,
  dhcpServerEnabled: false,
  enableStack: true,
  firmwareVersion: 'SPR09010e.bin',
  id: '58:fb:96:0e:82:8a',
  igmpSnooping: 'none',
  ipAddress: '10.206.10.37',
  ipAddressInterface: '1',
  ipAddressInterfaceType: 'VE',
  ipAddressType: 'dynamic',
  jumboMode: false,
  name: '7150stack',
  rearModule: 'none',
  specifiedType: 'AUTO',
  subnetMask: '255.255.254.0',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1'
}

export const freeVePortVlans = [
  {
    usedByVePort: true,
    vlanId: '1',
    vlanName: 'DEFAULT-VLAN'
  },
  {
    usedByVePort: true,
    vlanId: '2'
  },
  {
    usedByVePort: true,
    vlanId: '3'
  },
  {
    usedByVePort: false,
    vlanId: '4'
  },
  {
    usedByVePort: false,
    vlanId: '5'
  },
  {
    usedByVePort: false,
    vlanId: '6',
    vlanName: 'vlan name'
  }
]

export const switchDetailHeader = {
  activeSerial: 'FEK3230S0A0',
  cliApplied: false,
  clientCount: 1,
  cloudPort: 'INVALID',
  configReady: true,
  cpu: 23,
  defaultGateway: '10.206.11.254',
  deviceStatus: 'ONLINE',
  deviceType: 'DVCNWTYPE_SWITCH',
  dns: '10.10.10.106',
  family: 'ICX7150-C12P',
  firmware: 'SPR09010e',
  firmwareVersion: 'SPR09010e',
  floorplanId: '',
  formStacking: true,
  freeMemory: 155127808,
  id: '58:fb:96:0e:82:8a',
  ipAddress: '1.1.1.1',
  isIpFullContentParsed: true,
  isStack: true,
  memory: 84,
  model: 'ICX7150-C12P',
  modules: 'stack',
  name: '7150stack',
  numOfPorts: 32,
  numOfUnits: 2,
  poeUsage: {
    poeFree: 248000,
    poeTotal: 248000,
    poeUtilization: 0
  },
  portModuleIds: 'FEK3224R0A8FEK3230S0A0',
  portsStatus: {
    Down: 29,
    Up: 3
  },
  rearModule: 'none',
  sendedHostname: true,
  serialNumber: 'FEK3230S0A0',
  stackMember: false,
  stackMemberOrder: 'FEK3230S0A0,FEK3224R0A8,FEK3210S0A0,FEK3231S0A0',
  stackMembers: [
    {
      id: 'FEK3230S0A0',
      model: 'ICX7150-C12P'
    },
    {
      id: 'FEK3224R0A8',
      model: 'ICX7150-C12P'
    },
    {
      id: 'FEK3210S0A0',
      model: 'ICX7150-C12P'
    },
    {
      id: 'FEK3231S0A0',
      model: 'ICX7150-C12P'
    }
  ],
  staticOrDynamic: 'dynamic',
  subnetMask: '255.255.254.0',
  suspendingDeployTime: '',
  switchMac: '58:fb:96:0e:82:8a',
  switchName: '7150stack',
  switchType: 'router',
  syncDataEndTime: 1672683185852,
  syncedSwitchConfig: true,
  tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
  timestamp: 1672683185830,
  totalMemory: 1019744256,
  type: 'device',
  unitSerialNumbers: 'FEK3230S0A0,FEK3224R0A8',
  uptime: '18 days, 11:21:10.00',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  venueName: 'My-Venue',
  xPercent: 0,
  yPercent: 0
}

export const venueRoutedList = {
  data: [{
    connectedVe: true,
    defaultVlan: true,
    deviceStatus: 'OFFLINE',
    id: 'f064570d8dbc4329a69dd6df53fffdc6',
    ipAddress: '10.206.10.37',
    ipAddressType: 'dynamic',
    ipSubnetMask: '255.255.254.0',
    name: 'test',
    portType: 'VE',
    stack: true,
    switchId: '58:fb:96:0e:82:8a',
    switchName: '7150stack',
    syncedSwitchConfi: true,
    veId: 2,
    vlanId: 2
  }, {
    connectedVe: true,
    defaultVlan: true,
    deviceStatus: 'ONLINE',
    id: 'd073ae4be7b2420bb819b9770fbc3ca1',
    ipAddress: '10.206.10.29',
    ipAddressType: 'dynamic',
    ipSubnetMask: '255.255.254.0',
    name: 'test',
    portType: 'VE',
    stack: true,
    switchId: '58:fb:96:0e:bc:f8',
    switchName: 'ICX7150-C12 Router',
    syncedSwitchConfig: true,
    veId: 1,
    vlanId: 1
  }, {
    connectedVe: false,
    defaultVlan: false,
    deviceStatus: 'OFFLINE',
    id: 'be8be2c21a0447b18a568ecac9341e89',
    ipAddress: '1.1.1.1',
    ipSubnetMask: '255.255.255.0',
    portType: 'VE',
    stack: false,
    switchId: 'c0:c5:20:aa:32:79',
    switchName: 'FEK3224R0AG',
    syncedSwitchConfig: true,
    veId: 2,
    vlanId: 2
  }]
}

export const switchesList = {
  data: [{
    activeSerial: 'FEK3224R08X',
    cliApplied: false,
    configReady: false,
    deviceStatus: 'PREPROVISIONED',
    deviceTy: 'DVCNWTYPE_SWITCH',
    floorplanId: '',
    formStacking: false,
    id: 'FEK3224R08X',
    isStack: false,
    model: 'ICX7150-C12P',
    name: 'test stack',
    rearModule: 'none',
    serialNumber: 'FEK3224R08X',
    suspendingDeployTime: '',
    switchMac: '',
    syncDataEndTime: '',
    tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
    venueId: 'a98653366d2240b9ae370e48fab3a9a1',
    venueName: 'My-Venue',
    xPercent: 0,
    yPercent: 0
  },{
    id: '58:fb:96:0e:bc:f8',
    firmware: 'SPR09010e',
    firmwareVersion: 'SPR09010e',
    model: 'ICX7150-C12P',
    defaultGateway: '10.206.11.254',
    numOfPorts: 32,
    cpu: '21',
    memory: '73',
    uptime: '4 days, 5 hours',
    modules: 'stack',
    switchName: 'ICX7150-C12 Router',
    serialNumber: 'FEK3230S0C5',
    activeSerial: 'FEK3230S0C5',
    unitSerialNumbers: 'FEK3230S0C5,FEK3224R0AN',
    numOfUnits: 2,
    poeUtilization: 0,
    poeTotal: 248000,
    poeFree: 248000,
    family: 'ICX7150-C12P',
    cloudPort: 'INVALID',
    powerSupplyGroup: '',
    ipAddress: '10.206.10.29',
    type: 'device',
    tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
    deviceStatus: 'ONLINE',
    switchMac: '58:fb:96:0e:bc:f8',
    isStack: true,
    deviceType: 'DVCNWTYPE_SWITCH',
    name: 'ICX7150-C12 Router',
    venueId: 'a98653366d2240b9ae370e48fab3a9a1',
    venueName: 'My-Venue',
    clientCount: 1,
    floorplanId: '',
    xPercent: 0,
    yPercent: 0,
    subnetMask: '255.255.254.0',
    staticOrDynamic: 'dynamic',
    dns: '10.10.10.106',
    configReady: true,
    syncedSwitchConfig: true,
    switchType: 'router',
    syncDataId: '',
    syncDataEndTime: '2023-01-17T14:44:11Z',
    cliApplied: false,
    formStacking: false,
    suspendingDeployTime: '',
    rearModule: 'none'
  }]
}
