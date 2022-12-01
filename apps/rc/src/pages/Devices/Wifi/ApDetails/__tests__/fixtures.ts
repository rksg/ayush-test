import { ApDetailHeader, ApRadioBands, ApVenueStatusEnum } from '@acx-ui/rc/utils'

export const apDetailData: ApDetailHeader = {
  title: 'test-ap',
  headers: {
    overview: '2_00_Operational',
    clients: 1,
    networks: 2,
    services: 3
  }
}

export const apViewModel = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '',
      lastUpdTime: '2022-11-14T07:37:21.976Z',
      lastSeenTime: '2022-11-14T09:55:55.495Z',
      name: 'UI team ONLY',
      model: '',
      fwVersion: '',
      venueId: '16b11938ee934928a796534e2ee47661',
      venueName: 'venue-dhcp-ui',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
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
            channel: 0,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            channel: 0,
            band: '5G',
            Rssi: null,
            radioId: 1
          },
          {
            channel: 0,
            band: ApRadioBands.band50,
            Rssi: null,
            radioId: 2
          },
          {
            channel: 0,
            band: ApRadioBands.band50,
            Rssi: null,
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
      isMeshEnable: true
    }
  ]
}

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

export const apDetails = {
  serialNumber: '422039000034',
  apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
  venueId: '16b11938ee934928a796534e2ee47661',
  bonjourGateway: {
    rules: [
      { enabled: true, service: 'AIRTUNES', fromVlan: 33, toVlan: 22 },
      { enabled: true, service: 'AIRDISK', fromVlan: 1, toVlan: 3 }
    ]
  },
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      allowedChannels: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11'
      ],
      channelBandwidth: 'AUTO',
      txPower: 'Auto',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      allowedChannels: [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64',
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'Auto',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParamsDual5G: {
      enabled: true,
      radioParamsLower5G: {
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        txPower: 'MAX',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33
      },
      radioParamsUpper5G: {
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        txPower: 'MAX',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33
      }
    },
    apRadioParams6G: {
      manualChannel: 0,
      method: 'CHANNELFLY',
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      txPower: 'MAX',
      changeInterval: 33
    },
    enable6G: false,
    useVenueSettings: true,
    enable24G: true,
    enable50G: true
  },
  name: 'UI team ONLY',
  description: '',
  softDeleted: false,
  model: 'R650',
  updatedDate: '2022-11-15T08:37:42.987+0000'
}

export const apLanPorts = {
  lanPorts: [
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '1',
      enabled: true
    },
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '2',
      enabled: true
    }
  ],
  useVenueSettings: true
}

export const apRadio = {
  apRadioParams24G: {
    manualChannel: 0,
    allowedChannels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    channelBandwidth: 'AUTO',
    txPower: 'MAX',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33
  },
  apRadioParams50G: {
    allowedChannels: [
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '60',
      '64',
      '100',
      '104',
      '108',
      '112',
      '116',
      '120',
      '124',
      '128',
      '132',
      '136',
      '140',
      '144',
      '149',
      '153',
      '157',
      '161'
    ],
    channelBandwidth: 'AUTO',
    manualChannel: 0,
    txPower: 'MAX',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33
  },
  apRadioParamsDual5G: {
    enabled: false,
    lower5gEnabled: false,
    upper5gEnabled: false,
    radioParamsLower5G: {
      allowedChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    radioParamsUpper5G: {
      allowedChannels: [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128',
        '132',
        '136',
        '140',
        '144',
        '149',
        '153',
        '157',
        '161'
      ],
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    }
  },
  apRadioParams6G: {
    manualChannel: 0,
    method: 'CHANNELFLY',
    allowedChannels: [
      '1',
      '5',
      '9',
      '13',
      '17',
      '21',
      '25',
      '29',
      '33',
      '37',
      '41',
      '45',
      '49',
      '53',
      '57',
      '61',
      '65',
      '69',
      '73',
      '77',
      '81',
      '85',
      '89',
      '93',
      '97',
      '101',
      '105',
      '109',
      '113',
      '117',
      '121',
      '125',
      '129',
      '133',
      '137',
      '141',
      '145',
      '149',
      '153',
      '157',
      '161',
      '165',
      '169',
      '173',
      '177',
      '181',
      '185',
      '189',
      '193',
      '197',
      '201',
      '205',
      '209',
      '213',
      '217',
      '221'
    ],
    channelBandwidth: 'AUTO',
    bssMinRate6G: 'HE_MCS_0',
    mgmtTxRate6G: '6',
    txPower: 'MAX',
    changeInterval: 33
  },
  enable6G: false,
  useVenueSettings: true,
  enable24G: true,
  enable50G: true
}
