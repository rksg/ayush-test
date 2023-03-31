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

// eslint-disable-next-line max-len
export const apSampleImage = 'data:image/jpeg;base64,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/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAADhCSU0EAAAAAAAAAgAAOEJJTQQCAAAAAAACAAA4QklNBDAAAAAAAAEBADhCSU0ELQAAAAAABgABAAAAAjhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAANLAAAABgAAAAAAAAAAAAAAZAAAAOoAAAALAHAAbABhAGMAZQBoAG8AbABkAGUAcgAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAA6gAAAGQAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAGQAAAAAUmdodGxvbmcAAADqAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGljZQAAABIAAAAHc2xpY2VJRGxvbmcAAAAAAAAAB2dyb3VwSURsb25nAAAAAAAAAAZvcmlnaW5lbnVtAAAADEVTbGljZU9yaWdpbgAAAA1hdXRvR2VuZXJhdGVkAAAAAFR5cGVlbnVtAAAACkVTbGljZVR5cGUAAAAASW1nIAAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAABkAAAAAFJnaHRsb25nAAAA6gAAAAN1cmxURVhUAAAAAQAAAAAAAG51bGxURVhUAAAAAQAAAAAAAE1zZ2VURVhUAAAAAQAAAAAABmFsdFRhZ1RFWFQAAAABAAAAAAAOY2VsbFRleHRJc0hUTUxib29sAQAAAAhjZWxsVGV4dFRFWFQAAAABAAAAAAAJaG9yekFsaWduZW51bQAAAA9FU2xpY2VIb3J6QWxpZ24AAAAHZGVmYXVsdAAAAAl2ZXJ0QWxpZ25lbnVtAAAAD0VTbGljZVZlcnRBbGlnbgAAAAdkZWZhdWx0AAAAC2JnQ29sb3JUeXBlZW51bQAAABFFU2xpY2VCR0NvbG9yVHlwZQAAAABOb25lAAAACXRvcE91dHNldGxvbmcAAAAAAAAACmxlZnRPdXRzZXRsb25nAAAAAAAAAAxib3R0b21PdXRzZXRsb25nAAAAAAAAAAtyaWdodE91dHNldGxvbmcAAAAAADhCSU0EKAAAAAAADAAAAAI/8AAAAAAAADhCSU0EEQAAAAAAAQEAOEJJTQQUAAAAAAAEAAAAAzhCSU0EDAAAAAAE3gAAAAEAAACfAAAARAAAAeAAAH+AAAAEwgAYAAH/2P/tAAxBZG9iZV9DTQAC/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgARACfAwEiAAIRAQMRAf/dAAQACv/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAwQFBgcICQoLEAABBAEDAgQCBQcGCAUDDDMBAAIRAwQhEjEFQVFhEyJxgTIGFJGhsUIjJBVSwWIzNHKC0UMHJZJT8OHxY3M1FqKygyZEk1RkRcKjdDYX0lXiZfKzhMPTdePzRieUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9jdHV2d3h5ent8fX5/cRAAICAQIEBAMEBQYHBwYFNQEAAhEDITESBEFRYXEiEwUygZEUobFCI8FS0fAzJGLhcoKSQ1MVY3M08SUGFqKygwcmNcLSRJNUoxdkRVU2dGXi8rOEw9N14/NGlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vYnN0dXZ3eHl6e3x//aAAwDAQACEQMRAD8A9VSSSSUpJJJJSkkkznBolxgDukpdJDl7+JY3x/OP/kU/pN8Xf5zv70lM0lD0/Bzh85/6qUtj+zz8wP7klM0lCLf3m/cf/JJfpZ4aR8SP4FJTNJQ3WTqz7j/fCW93djvw/wDJJKZpKHqt8HD+yUvWr/ej46flSUzSURZWeHA/AhOkpdJJJJT/AP/Q9VSSSSUpJM5zWiXGAoQ9/MsZ4fnH/wAikpd1mu1g3O7+A/rOSbXruedzhx4D+qFJrQ0Q0QB2TpKUkkkkpSSSSSlJJJJKUkkkkpSSShvLtGa+Ljx/5kkpd+wD3Aa9omUM1wQ8NDIIgCJ1Me4hEawAzy7u4pWfRHxb+UJKZJJJJKf/0fVVF7i1sgSdAPmpKL+B8R+VJTBu0Hc7c5/iWnT+r+6peozxj46KaSSmIew8OB+akmLQeQCm9Ov90fckpkko+m3tI+ZS2eDnD5z/ANUkpkkobX9nn5gf7E8WeI+7/akpkkofpPBp+ZH8Cluf3bPwP9+1JTNRc4N55PAHJTTYdANvmdfwCdrA3XknknkpKW2uf9PQfuj/AL8pJ1DcXfQ4/fPH9n95JS7nBvPJ4A5KYNc4gu0A1DR/35O1gbryTyTyVJJSkkkklP8A/9L1VReCRpqQQY+BUkklMd57tP4fwKXqDwP3FSSSUw9Svu4D46flTh7TwQfmpJi1p5AKSl0lH06/3R9yXpt8x8CR/FJTJJR2eDnD5z+VLa7s8/MBJTJJRizxH3f+ZJfpPAH5kfwSUyUXPDdOXHho5TfpD4N8xqU7WhvHfk9ykpbYXa2cfujj5/vKaSSSlJJJJKUkkkkp/9P1VJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn6qSXyqkkp+qkl8qpJKfqpJfKqSSn/9k4QklNBCEAAAAAAF0AAAABAQAAAA8AQQBkAG8AYgBlACAAUABoAG8AdABvAHMAaABvAHAAAAAXAEEAZABvAGIAZQAgAFAAaABvAHQAbwBzAGgAbwBwACAAQwBDACAAMgAwADEANwAAAAEAOEJJTQQGAAAAAAAHAAQAAAABAQD/4Q3haHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzOCA3OS4xNTk4MjQsIDIwMTYvMDkvMTQtMDE6MDk6MDEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChNYWNpbnRvc2gpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNi0xMS0yOVQyMDo0ODoxNCswMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNi0xMS0yOVQyMDo0ODoxNCswMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTYtMTEtMjlUMjA6NDg6MTQrMDI6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZGYxMTI4OTItMDlhNi00YzZkLThkN2YtYWM4MjdjYzgxMTgyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YmM3OTMzZWYtZjZmMi0xMTc5LTg2MjYtYmU3NmE0ODEwOGRiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6M2QzZjgxNzctZjkwNS00YTllLThlMzUtMmY1ZDAzMGMyNzlkIiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNkM2Y4MTc3LWY5MDUtNGE5ZS04ZTM1LTJmNWQwMzBjMjc5ZCIgc3RFdnQ6d2hlbj0iMjAxNi0xMS0yOVQyMDo0ODoxNCswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmRmMTEyODkyLTA5YTYtNGM2ZC04ZDdmLWFjODI3Y2M4MTE4MiIgc3RFdnQ6d2hlbj0iMjAxNi0xMS0yOVQyMDo0ODoxNCswMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/7gAOQWRvYmUAZAAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYGCAsMCgoLCgoMEAwMDAwMDBAMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAQcHBw0MDRgQEBgUDg4OFBQODg4OFBEMDAwMDBERDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCABkAOoDAREAAhEBAxEB/90ABAAe/8QBogAAAAcBAQEBAQAAAAAAAAAABAUDAgYBAAcICQoLAQACAgMBAQEBAQAAAAAAAAABAAIDBAUGBwgJCgsQAAIBAwMCBAIGBwMEAgYCcwECAxEEAAUhEjFB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'

export const apPhoto = {
  imageId: '744e96b2c2a447ef949e7ede25e959c0-001.jpeg',
  imageName: 'download.jpeg',
  imageUrl: '/ap/sample.png',
  id: '8fb8fc5afe814a8ca4f6ce5406f86b98',
  createdDate: '2022-11-17T09:27:56.566+0000',
  updatedDate: '2022-11-23T07:51:17.448+0000'
}

export const apNoPhoto = {
  imageId: '744e96b2c2a447ef949e7ede25e959c0-001.jpeg',
  imageName: 'download.jpeg',
  id: '8fb8fc5afe814a8ca4f6ce5406f86b98',
  createdDate: '2022-11-17T09:27:56.566+0000',
  updatedDate: '2022-11-23T07:51:17.448+0000'
}

export const wifiCapabilities = {
  version: '6.2.0.103.513',
  apModels: [
    {
      model: 'R650',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: false,
          supportDisable: true,
          isPoePort: false,
          isPoeOutPort: false
        },
        {
          id: '2',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094',
          trunkPortOnly: false,
          supportDisable: false,
          isPoePort: true,
          isPoeOutPort: false
        }
      ],
      allowDfsCountry: ['US', 'SG'],
      allowCbandCountry: ['GB'],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: false,
      has160MHzChannelBandwidth: true,
      canSupportPoeOut: false,
      canSupportPoeMode: true,
      canSupportLacp: true,
      requireOneEnabledTrunkPort: true,
      poeModeCapabilities: ['Auto', '802.3af', '802.3at'],
      lanPortPictureDownloadUrl:
        'r650.jpg',
      // eslint-disable-next-line max-len
      pictureDownloadUrl: '/ap/sample.png',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 140,
      supportTriRadio: false,
      supportDual5gMode: false,
      supportChannel144: true,
      support11AX: true,
      maxChannelization24G: 40,
      maxChannelization5G: 160
    }
  ]
}
