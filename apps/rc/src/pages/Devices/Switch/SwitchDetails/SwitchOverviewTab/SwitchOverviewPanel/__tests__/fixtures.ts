import { STACK_MEMBERSHIP, SwitchStatusEnum, SWITCH_TYPE } from '@acx-ui/rc/utils'

export const stackMemberStandalone = [
  {
    serialNumber: 'FEK3230S0DA',
    unitName: 'ICX7150-C12 Router',
    poeFree: 108600,
    uptime: '41 days, 0 hours',
    deviceStatus: SwitchStatusEnum.OPERATIONAL,
    unitStatus: STACK_MEMBERSHIP.ACTIVE,
    venueName: 'My-Venue',
    switchMac: '58:fb:96:0e:c0:c4',
    unitId: 1,
    model: 'ICX7150-C12P',
    activeSerial: 'FEK3230S0DA',
    poeTotal: 124000,
    id: 'FEK3230S0DA',
    poeUtilization: 15400,
    order: '1'
  }
]

export const switchDetailSatckOnline = {
  type: 'device',
  isStack: true,
  rearModule: 'none',
  switchMac: '58:fb:96:0e:c0:c4',
  switchName: 'ICX7150-C12 Router',
  model: 'ICX7150-C12P',
  id: '58:fb:96:0e:c0:c4',
  firmwareVersion: 'SPR09010e',
  freeMemory: 274526208,
  clientCount: 2,
  floorplanId: '',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK3230S0DA',
  yPercent: 0,
  portsStatus: {
    Down: 27,
    Up: 5
  },
  staticOrDynamic: 'dynamic',
  ipAddress: '10.206.10.28',
  dns: '10.10.10.106',
  cpu: 29,
  stackMember: false,
  cliApplied: true,
  subnetMask: '255.255.254.0',
  unitSerialNumbers: 'FEK3230S0DA',
  modules: 'switch',
  venueName: 'My-Venue',
  isIpFullContentParsed: true,
  name: 'ICX7150-C12 Router',
  activeSerial: 'FEK3230S0DA',
  suspendingDeployTime: '',
  cloudPort: 'INVALID',
  stackMemberOrder: 'FEK3230S0DA',
  numOfUnits: 1,
  memory: 73,
  switchType: SWITCH_TYPE.ROUTER,
  crtTime: '1676287992033',
  portModuleIds: 'FEK3230S0DA',
  configReady: true,
  deviceStatus: SwitchStatusEnum.OPERATIONAL,
  sendedHostname: true,
  venueId: 'a98653366d2240b9ae370e48fab3a9a1',
  firmware: 'SPR09010e',
  timestamp: 1677143094679,
  xPercent: 0,
  syncedSwitchConfig: true,
  defaultGateway: '10.206.11.254',
  stackMembers: [
    {
      model: 'ICX7150-C12P',
      id: 'FEK3230S0DA'
    }
  ],
  uptime: '41 days, 1:6:54.00',
  poeUsage: {
    poeFree: 108600,
    poeTotal: 124000,
    poeUtilization: 15400
  },
  totalMemory: 1019744256,
  tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
  family: 'ICX7150-C12P',
  numOfPorts: 16
}

export const switchDetailSwitchOffline = {
  deviceType: 'DVCNWTYPE_SWITCH',
  suspendingDeployTime: '',
  stackMemberOrder: '',
  serialNumber: 'FEK3224R07X',
  xPercent: 0,
  yPercent: 0,
  portsStatus: {},
  stackMember: false,
  cliApplied: false,
  isStack: false,
  rearModule: 'none',
  deviceStatus: SwitchStatusEnum.DISCONNECTED,
  poeUsage: {},
  venueName: 'test9',
  isIpFullContentParsed: false,
  sendedHostname: true,
  switchMac: '',
  venueId: '9417693931ab409ca41ecf9b36f516be',
  name: '',
  tenantId: 'f2e4a77d49914dc7b1bcb0dfc21b9a74',
  activeSerial: 'FEK3224R07X',
  model: 'ICX7150-C12P',
  id: 'FEK3224R07X',
  floorplanId: '',
  configReady: false,
  syncedSwitchConfig: false,
  stackMembers: []
}