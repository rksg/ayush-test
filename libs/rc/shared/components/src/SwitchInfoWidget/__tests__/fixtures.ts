import { SwitchStatusEnum } from '@acx-ui/rc/utils'

export const switchDetail = {
  suspendingDeployTime: '',
  stackMemberOrder: '',
  isStack: false,
  rearModule: 'none',
  deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
  sendedHostname: false,
  switchMac: '',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  model: 'ICX7150-C08P',
  id: 'FMF2249Q0JT',
  floorplanId: '94bed28abef24175ab58a3800d01e24a',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FMF2249Q0JT',
  xPercent: 56.05815887451172,
  yPercent: 60.4040412902832,
  portsStatus: {},
  stackMember: false,
  cliApplied: false,
  poeUsage: {},
  venueName: 'My-Venue',
  isIpFullContentParsed: false,
  formStacking: false,
  name: 'FMF2249Q0JT',
  tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
  activeSerial: 'FMF2249Q0JT',
  configReady: true,
  syncedAdminPassword: true,
  syncedSwitchConfig: true
}

export const stackDetailData = {
  suspendingDeployTime: '',
  stackMemberOrder: 'FEK4224R19X,FEK4224R18X,FEK4224R17X',
  isStack: false,
  rearModule: 'none',
  staticOrDynamic: 'static',
  deviceStatus: 'PREPROVISIONED',
  sendedHostname: false,
  switchMac: '',
  venueId: 'eb4ef94ba7014f64b69be926faccbc09',
  model: 'ICX7150-C12P',
  id: 'FEK4224R19X',
  floorplanId: '',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK4224R19X',
  xPercent: 0,
  yPercent: 0,
  portsStatus: {
  },
  stackMember: false,
  cliApplied: false,
  stackMembers: [
    {
      model: 'ICX7150-C12P',
      id: 'FEK4224R19X'
    },
    {
      id: 'FEK4224R18X'
    },
    {
      id: 'FEK4224R17X'
    }
  ],
  poeUsage: {
  },
  venueName: 'test',
  isIpFullContentParsed: false,
  formStacking: true,
  name: 'FEK4224R19X',
  tenantId: 'fe892a451d7a486bbb3aee929d2dfcd1',
  activeSerial: 'FEK4224R19X',
  dns: 'http://localhost:3000/',
  unitDetails: [
    {
      venueName: 'test',
      unitStatus: 'Active',
      unitId: 1,
      serialNumber: 'FEK4224R19X',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R19X',
      id: 'FEK4224R19X',
      uptime: '',
      order: '1'
    },
    {
      venueName: 'test',
      serialNumber: 'FEK4224R18X',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R18X',
      id: 'FEK4224R18X',
      uptime: '',
      order: '2'
    },
    {
      venueName: 'test',
      serialNumber: 'FEK4224R17X',
      operStatusFound: false,
      switchMac: '',
      activeSerial: 'FEK4224R17X',
      id: 'FEK4224R17X',
      uptime: '',
      order: '3'
    }
  ]
}