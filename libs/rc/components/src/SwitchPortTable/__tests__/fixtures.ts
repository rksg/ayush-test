/* eslint-disable max-len */
export const selectedPorts = [{
  adminStatus: 'Down',
  broadcastIn: '0',
  broadcastOut: '0',
  cloudPort: false,
  crcErr: '0',
  deviceStatus: 'ONLINE',
  egressAclName: 'test acl',
  id: 'c0-c5-20-aa-32-7d_1-1-5',
  inDiscard: '0',
  inErr: '0',
  inactiveRow: false,
  inactiveTooltip: '',
  lagId: '0',
  lagName: '',
  multicastIn: '0',
  multicastOut: '0',
  name: 'GigabitEthernet1/1/5',
  neighborName: '',
  opticsType: '1 Gbits per second copper',
  outErr: '0',
  poeEnabled: true,
  poeTotal: 0,
  poeType: 'n/a',
  poeUsed: 0,
  portId: 'c0-c5-20-aa-32-7d_1-1-5',
  portIdentifier: '5',
  portSpeed: 'link down or no traffic',
  signalIn: 0,
  signalOut: 0,
  stack: false,
  status: 'Down',
  switchMac: 'c0:c5:20:aa:32:79',
  switchModel: 'ICX7150-C12P',
  switchName: 'FEK3224R0AG',
  switchSerial: 'c0:c5:20:aa:32:79',
  switchUnitId: 'FEK3224R0AG',
  syncedSwitchConfig: true,
  unTaggedVlan: '1',
  unitState: 'ONLINE',
  unitStatus: 'Standalone',
  usedInFormingStack: false,
  vlanIds: '2 1'
}, {
  adminStatus: 'Up',
  cloudPort: false,
  deviceStatus: 'ONLINE',
  hierarchy: ['58-fb-96-0e-82-8e_1-1-5'],
  id: '58-fb-96-0e-82-8e_1-1-5',
  isFirstLevel: true,
  lagId: '0',
  name: 'GigabitEthernet1/1/5',
  neighborName: '',
  poeEnabled: false,
  poeTotal: 0,
  poeUsed: 0,
  portId: '58-fb-96-0e-82-8e_1-1-5',
  portIdentifier: '1/1/5',
  portSpeed: 'link down or no traffic',
  signalIn: 0,
  signalOut: 0,
  stack: true,
  status: 'Down',
  switchMac: '58:fb:96:0e:82:8a',
  switchModel: 'ICX7150-C12P',
  switchName: '7150stack',
  switchSerial: '58:fb:96:0e:82:8a',
  switchUnitId: 'FEK3230S0A0',
  syncedSwitchConfig: true,
  unTaggedVlan: '2',
  unitState: 'ONLINE',
  unitStatus: 'Active',
  usedInFormingStack: false,
  vlanIds: '1'
}, {
  adminStatus: 'Up',
  broadcastIn: '0',
  broadcastOut: '0',
  cloudPort: false,
  crcErr: '0',
  deviceStatus: 'ONLINE',
  id: 'c0-c5-20-aa-32-7e_1-1-6',
  inDiscard: '0',
  inErr: '0',
  inactiveRow: false,
  inactiveTooltip: '',
  lagId: '0',
  lagName: '',
  multicastIn: '0',
  multicastOut: '0',
  name: 'GigabitEthernet1/1/6',
  neighborName: '',
  opticsType: '1 Gbits per second copper',
  outErr: '0',
  poeEnabled: true,
  poeTotal: 0,
  poeType: 'n/a',
  poeUsed: 0,
  portId: 'c0-c5-20-aa-32-7e_1-1-6',
  portIdentifier: '1/1/6',
  portSpeed: 'link down or no traffic',
  signalIn: 0,
  signalOut: 0,
  stack: false,
  status: 'Down',
  switchMac: 'c0:c5:20:aa:32:79',
  switchModel: 'ICX7150-C12P',
  switchName: 'FEK3224R0AG',
  switchSerial: 'c0:c5:20:aa:32:79',
  switchUnitId: 'FEK3224R0AG',
  syncedSwitchConfig: true,
  unTaggedVlan: '1',
  unitState: 'ONLINE',
  unitStatus: 'Standalone',
  usedInFormingStack: false,
  vlanIds: '1'
}]

export const switchDetailHeader = {
  activeSerial: 'FEK3224R0AG',
  cliApplied: false,
  clientCount: 1,
  cloudPort: 'INVALID',
  configReady: true,
  cpu: 32,
  defaultGateway: '10.206.11.254',
  deviceStatus: 'ONLINE',
  deviceType: 'DVCNWTYPE_SWITCH',
  dns: '10.10.10.106',
  family: 'ICX7150-C12P',
  firmware: 'SPR09010e',
  firmwareVersion: 'SPR09010e',
  floorplanId: '',
  formStacking: false,
  freeMemory: 262000640,
  id: 'c0:c5:20:aa:32:79',
  ipAddress: '10.206.10.27',
  isIpFullContentParsed: true,
  isStack: false,
  memory: 74,
  model: 'ICX7150-C12P',
  modules: 'switch',
  name: 'FEK3224R0AG',
  numOfPorts: 16,
  numOfUnits: 1,
  poeUsage: { poeFree: 124000, poeTotal: 124000, poeUtilization: 0 },
  portModuleIds: 'FEK3224R0AG',
  portsStatus: { Down: 14, Up: 2 },
  rearModule: 'none',
  sendedHostname: true,
  serialNumber: 'FEK3224R0AG',
  stackMember: false,
  stackMemberOrder: '',
  stackMembers: [],
  staticOrDynamic: 'dynamic',
  subnetMask: '255.255.254.0',
  suspendingDeployTime: '',
  switchMac: 'c0:c5:20:aa:32:79',
  switchName: 'FEK3224R0AG',
  switchType: 'router',
  syncDataEndTime: 1672685019090,
  syncedSwitchConfig: true,
  temperatureGroups: '[{"serialNumber":"FEK3224R0AG","stackId":"C0 C5 20 AA 32 79","temperatureSlotList":[{"slotNumber":3,"temperatureValue":48},{"slotNumber":4,"temperatureValue":49},{"slotNumber":1,"temperatureValue":64},{"slotNumber":2,"temperatureValue":10}]}]',
  tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
  timestamp: 1672685019073,
  totalMemory: 1019744256,
  type: 'device',
  unitSerialNumbers: 'FEK3224R0AG',
  uptime: '10 days, 11:5:24.00',
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  venueName: 'My-Venue',
  xPercent: 0,
  yPercent: 0
}

export const defaultVlan = [{
  defaultVlanId: 1,
  switchId: 'c0:c5:20:aa:32:79'
}, {
  defaultVlanId: 2,
  switchId: '58:fb:96:0e:82:8a'
}]

export const switchVlanUnion = {
  profileVlan: [
    { vlanConfigName: 'vlan name', profileLevel: true, defaultVlan: false, vlanId: 6 },
    { profileLevel: true, defaultVlan: false, vlanId: 2 },
    { profileLevel: true, defaultVlan: false, vlanId: 3 },
    { profileLevel: true, defaultVlan: false, vlanId: 5 },
    { profileLevel: true, defaultVlan: false, vlanId: 4 }
  ],
  switchDefaultVlan: [{
    defaultVlan: true,
    profileLevel: false,
    switchId: 'c0:c5:20:aa:32:79',
    vlanConfigName: 'DEFAULT-VLAN',
    vlanId: 1
  }],
  switchVlan: [
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 99 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 88 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 77 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 66 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 55 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 44 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 33 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 22 },
    { switchId: 'c0:c5:20:aa:32:79', vlanConfigName: 'g', profileLevel: false, defaultVlan: false, vlanId: 14 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 13 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 41 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 76 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 32 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 333 },
    { switchId: 'c0:c5:20:aa:32:79', vlanConfigName: '1111', profileLevel: false, defaultVlan: false, vlanId: 111 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 1111 },
    { switchId: 'c0:c5:20:aa:32:79', profileLevel: false, defaultVlan: false, vlanId: 16 },
    { switchId: 'c0:c5:20:aa:32:79', vlanConfigName: '999', profileLevel: false, defaultVlan: false, vlanId: 999 }
  ]
}

export const vlansByVenue = [{
  arpInspection: true,
  id: '16dd285eac0d4663aa449b6498f4c075',
  igmpSnooping: 'passive',
  ipv4DhcpSnooping: true,
  multicastVersion: 3,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'stp',
  vlanId: 6,
  vlanName: 'vlan name'
}, {
  arpInspection: false,
  id: '52d05e5053404b16883633c88a85e084',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  switchFamilyModels: [{
    id: 'e5d57359201a4fa0b0058c425412596f',
    model: 'ICX7150-48',
    slots: [
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 1, enable: true }],
    untaggedPorts: '1/1/29,1/1/30'
  }],
  vlanId: 1
}, {
  arpInspection: false,
  id: '44d69a27a89a48c582dc554ced7157e4',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  switchFamilyModels: [{
    id: 'e5d57359201a4fa0b0058c425412596f',
    model: 'ICX7150-C12P',
    slots: [
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 1, enable: true }],
    taggedPorts: '1/1/6,1/1/9,1/1/11',
    untaggedPorts: '1/1/4'
  }],
  vlanId: 2
}, {
  arpInspection: false,
  id: '2a7f2eaa0b914a47bb0b9a90d53ad17d',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  switchFamilyModels: [{
    id: 'e5d57359201a4fa0b0058c425412596f',
    model: 'ICX7150-C12P',
    slots: [
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 1, enable: true }],
    taggedPorts: '1/1/9,1/1/11',
    untaggedPorts: '1/1/6,1/1/8,1/1/10'
  }],
  vlanId: 3
}, {
  arpInspection: false,
  id: 'f77ac67a88bd41ec82682676489bdcf7',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  vlanId: 5
}, {
  arpInspection: false,
  id: '82ec23dd19ce4e089f442c814a11b97a',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  vlanId: 4
}]

export const switchProfile = [{
  acls: [],
  id: 'ed9284cc9343484f9eb97addf31c1c5e',
  name: 'regular',
  profileType: 'Regular',
  venues: ['a98653366d2240b9ae370e48fab3a9a1'],
  vlans: vlansByVenue
}]

export const switchRoutedList = {
  data: [{
    defaultVlan: false,
    deviceStatus: 'ONLINE',
    id: 'bfe5427fae9f4ea7a35bcde4a746bfe1',
    ipAddress: '1.1.1.1',
    ipSubnetMask: '255.255.255.0',
    portType: 'VE',
    stack: false,
    switchId: 'c0:c5:20:aa:32:79',
    switchName: 'FEK3224R0AG',
    syncedSwitchConfig: true,
    veId: 2,
    vlanId: 2
  }, {
    defaultVlan: true,
    deviceStatus: 'ONLINE',
    dhcpRelayAgent: '2.2.2.2',
    id: '204fb3fa4f1d41279993db8bb1ef446a',
    ipAddress: '10.206.10.27',
    ipAddressType: 'dynamic',
    ipSubnetMask: '255.255.254.0',
    name: 'www',
    ospfArea: '1.1.1.1',
    portType: 'VE',
    stack: false,
    switchId: 'c0:c5:20:aa:32:79',
    switchName: 'FEK3224R0AG',
    syncedSwitchConfig: true,
    veId: 1,
    vlanId: 1
  }],
  fields: ['id', 'portNumber', 'portType'],
  totalCount: 2,
  totalPages: 1
}

export const switchVlans = [{
  arpInspection: true,
  id: '524c68bfb9a54391892662a4a5b14755',
  igmpSnooping: 'passive',
  ipv4DhcpSnooping: true,
  multicastVersion: 3,
  spanningTreeProtocol: 'stp',
  vlanId: 6,
  vlanName: 'vlan name'
}]

export const portSetting = [{
  dhcpSnoopingTrust: false,
  id: 'c0:c5:20:aa:32:79/1/1/5',
  ipsg: false,
  lldpEnable: false,
  poeCapability: true,
  poeClass: 'ZERO',
  poeEnable: true,
  poePriority: 3,
  port: '1/1/5',
  portEnable: false,
  portProtected: false,
  portSpeed: 'TEN_M_FULL',
  ports: ['1/1/5'],
  revert: false,
  rstpAdminEdgePort: false,
  stpBpduGuard: false,
  stpRootGuard: false,
  switchId: 'c0:c5:20:aa:32:79',
  switchMac: 'c0:c5:20:aa:32:79',
  taggedVlans: ['2'],
  untaggedVlan: '1',
  voiceVlan: 0
}, {
  dhcpSnoopingTrust: false,
  id: 'c0:c5:20:aa:32:79/1/1/6',
  ipsg: true,
  lldpEnable: false,
  lldpQos: [{
    applicationType: 'GUEST_VOICE',
    dscp: 0,
    id: '3df095a0926741b5ac2f9f1f09ffccff',
    priority: 0,
    qosVlanType: 'PRIORITY_TAGGED'
  }],
  poeBudget: 1000,
  poeCapability: true,
  poeClass: 'ONE',
  poeEnable: true,
  poePriority: 2,
  port: '1/1/6',
  portEnable: true,
  portProtected: true,
  portSpeed: 'AUTO',
  ports: ['1/1/4', '1/1/6'],
  revert: true,
  rstpAdminEdgePort: true,
  stpBpduGuard: true,
  stpRootGuard: true,
  switchMac: 'c0:c5:20:aa:32:79',
  untaggedVlan: '2',
  ingressAcl: 'test-acl',
  egressAcl: 'test-acl',
  tags: 'aa,bb'
}]

export const portsSetting = {
  requestId: '06d3d561-f831-4fd2-b8fb-9c1d0142e4ac',
  response: [{
    dhcpSnoopingTrust: false,
    id: 'c0:c5:20:aa:32:79/1/1/5',
    ipsg: false,
    lldpEnable: false,
    poeCapability: true,
    poeClass: 'ZERO',
    poeEnable: true,
    poePriority: 3,
    port: '1/1/5',
    portEnable: false,
    portProtected: false,
    portSpeed: 'TEN_M_FULL',
    ports: ['1/1/5'],
    revert: false,
    rstpAdminEdgePort: false,
    stpBpduGuard: false,
    stpRootGuard: false,
    switchMac: 'c0:c5:20:aa:32:79',
    taggedVlans: ['2'],
    untaggedVlan: '1',
    voiceVlan: 0
  }, {
    dhcpSnoopingTrust: false,
    id: 'c0:c5:20:aa:32:79/1/1/6',
    ipsg: true,
    lldpEnable: false,
    lldpQos: [{
      applicationType: 'GUEST_VOICE',
      dscp: 0,
      id: '3df095a0926741b5ac2f9f1f09ffccff',
      priority: 0,
      qosVlanType: 'PRIORITY_TAGGED'
    }],
    poeBudget: 1000,
    poeCapability: true,
    poeClass: 'ONE',
    poeEnable: true,
    poePriority: 2,
    port: '1/1/6',
    portEnable: true,
    portProtected: true,
    portSpeed: 'AUTO',
    ports: ['1/1/4', '1/1/6'],
    revert: false,
    rstpAdminEdgePort: true,
    stpBpduGuard: true,
    stpRootGuard: true,
    switchMac: 'c0:c5:20:aa:32:79',
    untaggedVlan: '2',
    ingressAcl: 'test-acl',
    egressAcl: 'test-acl',
    tags: 'aa,bb'
  }, {
    dhcpSnoopingTrust: false,
    id: '58:fb:96:0e:82:8a/1/1/5',
    ipsg: false,
    lldpEnable: true,
    poeCapability: true,
    poeClass: 'ZERO',
    poeEnable: false,
    poePriority: 3,
    port: '1/1/5',
    portEnable: true,
    portProtected: false,
    portSpeed: 'AUTO',
    ports: ['1/1/5'],
    revert: true,
    rstpAdminEdgePort: false,
    stpBpduGuard: false,
    stpRootGuard: false,
    switchMac: '58:fb:96:0e:82:8a',
    untaggedVlan: '1'
  }]
}

export const aclUnion = {
  profileAcl: ['17', '18', '3', '5', '2','1','4','12', '16','6', 'all',
    '8','7','9','19','13','14','20','15','ee','extended','22','11','33'],
  switchAcl: ['test1', 'test acl']
}

export const switchesVlan = {
  profileVlan: [
    { profileLevel: true, defaultVlan: false, vlanId: 2 },
    { profileLevel: true, defaultVlan: false, vlanId: 3 },
    { profileLevel: true, defaultVlan: false, vlanId: 4 },
    { profileLevel: true, defaultVlan: false, vlanId: 5 },
    { vlanConfigName: 'vlan name', profileLevel: true, defaultVlan: false, vlanId: 6 }
  ],
  switchDefaultVlan: [{
    defaultVlan: true,
    profileLevel: false,
    switchId: '58:fb:96:0e:82:8a',
    vlanConfigName: 'DEFAULT-VLAN',
    vlanId: 1
  }]
}

export const untaggedVlansByVenue = [{
  arpInspection: true,
  id: 'aa476019019f4557a4d278a7d4cf0121',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  switchFamilyModels: [{
    id: 'cc1ada66a21940b0ad01f3b3879b05a4',
    model: 'ICX7150-C12P',
    slots: [
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 3, enable: true, option: '2X1/10G' },
      { slotNumber: 1, enable: true }
    ],
    taggedPorts: '1/1/9,1/1/11',
    untaggedPorts: '1/1/6,1/1/8,1/1/10'
  }],
  vlanId: 6,
  vlanName: '6'
}]

export const taggedVlansByVenue = [{
  arpInspection: false,
  id: '2c988859002040428830955e7b2b161b',
  igmpSnooping: 'none',
  ipv4DhcpSnooping: false,
  spanningTreePriority: 32768,
  spanningTreeProtocol: 'none',
  switchFamilyModels: [{
    id: '234f27465ea3445492b1ae7c63605342',
    model: 'ICX7150-C12P',
    slots: [
      { slotNumber: 2, enable: true, option: '2X1G' },
      { slotNumber: 3, enable: true, option: '2X1/10G' },
      { slotNumber: 1, enable: true }],
    taggedPorts: '1/1/7,1/1/9,1/1/11',
    untaggedPorts: '1/1/5'
  }],
  vlanId: 7
}]