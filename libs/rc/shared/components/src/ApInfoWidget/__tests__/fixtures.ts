import { ApVenueStatusEnum } from '@acx-ui/rc/utils'

export const currentAP = {
  serialNumber: '',
  lastUpdTime: '2022-11-14T07:37:21.976Z',
  lastSeenTime: '11/14/2022 17:55:55',
  name: 'UI team ONLY',
  model: '',
  fwVersion: '',
  venueId: '16b11938ee934928a796534e2ee47661',
  venueName: 'venue-dhcp-ui',
  deviceStatus: '2_00_Operational',
  deviceStatusSeverity: ApVenueStatusEnum.OPERATIONAL,
  IP: '',
  extIp: '',
  apMac: '',
  rootAP: {
    name: 'test'
  },
  apDownRssi: 1,
  apUpRssi: 1,
  apStatusData: {
    APRadio: [
      {
        channel: '0',
        band: '2.4G',
        Rssi: 'null',
        radioId: 0
      },
      {
        channel: '0',
        band: '5G',
        Rssi: 'null',
        radioId: 1
      },
      {
        channel: '0',
        band: '5G',
        Rssi: 'null',
        radioId: 2
      },
      {
        channel: '0',
        band: '5G',
        Rssi: 'null',
        radioId: 1
      }
    ],
    APSystem: {
      uptime: 93308
    },
    cellularInfo: {
      cellular3G4GChannel: 0,
      cellularActiveSim: '',
      cellularBand: 'string',
      cellularCardRemovalCountSIM0: '',
      cellularCardRemovalCountSIM1: '',
      cellularConnectionStatus: '',
      cellularCountry: 'string',
      cellularDHCPTimeoutCountSIM0: '',
      cellularDHCPTimeoutCountSIM1: '',
      cellularDefaultGateway: 'string',
      cellularDownlinkBandwidth: 'string',
      cellularECIO: 0,
      cellularICCIDSIM0: '',
      cellularICCIDSIM1: '',
      cellularIMEI: '',
      cellularIMSISIM0: '',
      cellularIMSISIM1: '',
      cellularIPaddress: '',
      cellularIsSIM0Present: 'YES',
      cellularIsSIM1Present: 'YES',
      cellularLTEFirmware: 'string',
      cellularNWLostCountSIM0: '',
      cellularNWLostCountSIM1: '',
      cellularOperator: 'string',
      cellularRSCP: 0,
      cellularRSRP: 0,
      cellularRSRQ: 0,
      cellularRadioUptime: 0,
      cellularRoamingStatus: 'string',
      cellularRxBytesSIM0: '',
      cellularRxBytesSIM1: '',
      cellularSINR: 0,
      cellularSignalStrength: '',
      cellularSubnetMask: 'string',
      cellularSwitchCountSIM0: '',
      cellularSwitchCountSIM1: '',
      cellularTxBytesSIM0: '',
      cellularTxBytesSIM1: '',
      cellularUplinkBandwidth: 'string',
      cellularWanInterface: 'string'
    },
    lanPortStatus: [
      {
        port: '0',
        phyLink: 'Down  '
      },
      {
        port: '1',
        phyLink: 'Up 1000Mbps full'
      }
    ]
  },
  meshRole: 'DISABLED',
  deviceGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
  tags: '',
  deviceGroupName: '',
  deviceModelType: '',
  password: 'admin!234',
  isMeshEnable: true,
  uptime: '1 day, 1 hour',
  channel24: {
    channel: '0',
    band: '2.4G',
    Rssi: '',
    radioId: 0
  },
  // channel50: false,
  channelL50: {
    channel: '0',
    band: '5G',
    Rssi: '',
    radioId: 1
  },
  channelU50: {
    channel: '0',
    band: '5G',
    Rssi: '',
    radioId: 2
  }
  // channel60: false
}