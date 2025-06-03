import {
  ApRadioBands,
  ApVenueStatusEnum,
  AFCPowerMode,
  AFCStatus,
  ApViewModel,
  NetworkTypeEnum,
  RadioEnum, RadioTypeEnum, WlanSecurityEnum, ApModelFamily, ApModelFamilyType
} from '@acx-ui/rc/utils'

export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '5e75f787e010471984b18ad0eb156487',
      name: 'My-Venue',
      description: 'My-Venue',
      address: {
        country: 'United States',
        countryCode: 'US',
        city: 'New York',
        addressLine: '86 Main St,New York,United States',
        latitude: 40.70962,
        longitude: -73.8187822,
        timezone: 'America/New_York'
      },
      isTemplate: false,
      isEnforced: false
    },
    {
      country: 'United States',
      dhcp: { enabled: false, mode: 'DHCPMODE_EACH_AP' },
      id: '4c778ed630394b76b17bce7fe230cf9f',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue'
    },
    {
      country: 'Malaysia',
      dhcp: { enabled: true, mode: 'DHCPMODE_EACH_AP' },
      id: 'a4f9622e9c7547ba934fbb5ee55646c2',
      latitude: '4.854995099999999',
      longitude: '100.751032',
      name: 'Venue-DHCP'
    },
    {
      country: 'United States',
      dhcp: { enabled: true, mode: 'DHCPMODE_MULTIPLE_AP' },
      id: '16b11938ee934928a796534e2ee47661',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'Venue-DHCP 2'
    },
    {
      country: 'Canada',
      id: 'b6cd663931b34a8b8fc97a81bfaa0929',
      latitude: '51.12090129999999',
      longitude: '-114.0044601',
      name: 'Venue-MESH'
    }
  ]
}

export const apGroupsList = {
  fields: ['name', 'id'],
  totalCount: 0,
  page: 1,
  data: [
    {
      id: '484eb4220e4b424da1f54b207cc678b9',
      name: 'test'
    }
  ]
}

export const getApGroup = {
  venueId: '923f6df894c340498894a6b7c68feaae',
  aps: [
    {
      serialNumber: '123432223233',
      apGroupId: 'd318e522e2364b77a3032e641e6944d0',
      venueId: '923f6df894c340498894a6b7c68feaae',
      radio: {
        apRadioParams24G: {
          manualChannel: 0,
          channelBandwidth: 'AUTO',
          txPower: 'MAX',
          method: 'BACKGROUND_SCANNING',
          changeInterval: 33
        },
        apRadioParams50G: {
          channelBandwidth: 'AUTO',
          manualChannel: 0,
          txPower: 'MAX',
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
        useVenueSettings: true
      },
      name: '123432223233',
      softDeleted: false
    }
  ],
  isDefault: false,
  name: 'TEST AP GROUP',
  id: 'd318e522e2364b77a3032e641e6944d0'
}

export const venueDefaultApGroup = [
  {
    venueId: '74f058ee8ea141a0b09a89c022a04a10',
    aps: [
      {
        serialNumber: '233356777755',
        apGroupId: 'a43c7e10c6404b7684f8694e7d074cf2',
        venueId: '74f058ee8ea141a0b09a89c022a04a10',
        radio: {
          apRadioParams24G: {
            manualChannel: 0,
            channelBandwidth: 'AUTO',
            txPower: 'MAX',
            method: 'BACKGROUND_SCANNING',
            changeInterval: 33
          },
          apRadioParams50G: {
            channelBandwidth: 'AUTO',
            manualChannel: 0,
            txPower: 'MAX',
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
          useVenueSettings: true
        },
        name: 'for ap group 2',
        softDeleted: false,
        position: {
          xPercent: 0,
          yPercent: 0
        },
        updatedDate: '2022-11-08T06:31:00.064+0000'
      }
    ],
    isDefault: true,
    id: 'a43c7e10c6404b7684f8694e7d074cf2'
  }
]

export const venueCaps = {
  apModels: [
    {
      model: 'R760',
      version: '7.1.1.520.544',
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
      allowDfsCountry: [
        'US',
        'SG'
      ],
      allowCbandCountry: [
        'EG',
        'GB',
        'DE',
        'AT',
        'BE',
        'BG',
        'HR',
        'CY',
        'CZ',
        'DK',
        'EE',
        'FI',
        'FR',
        'GR',
        'HU',
        'IT',
        'LV',
        'LU',
        'MT',
        'NL',
        'NO',
        'PL',
        'PT',
        'RO',
        'SK',
        'SI',
        'ES',
        'SE',
        'LT',
        'IE',
        'ME',
        'CH',
        'IS'
      ],
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
      poeModeCapabilities: [
        'Auto',
        '802.3at',
        '802.3bt-Class_5'
      ],
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 288,
      supportTriRadio: true,
      supportDual5gMode: true,
      supportChannel144: true,
      support11AX: true,
      support11BE: false,
      maxChannelization24G: 40,
      maxChannelization5G: 160,
      maxChannelization6G: 160,
      supportMesh: true,
      supportBandCombination: false,
      supportAntennaType: false,
      supportApStickyClientSteering: true,
      supportAutoCellSizing: true,
      supportAggressiveTxPower: true,
      supportMesh5GOnly6GOnly: true,
      supportSmartMonitor: true,
      supportSoftGre: true,
      usbPowerEnable: true,
      supportIoT: true
    },
    {
      ledOn: true,
      model: 'E510'
    },
    {
      ledOn: true,
      model: 'H320',
      canSupportPoeMode: false,
      canSupportPoeOut: false,
      lanPortPictureDownloadUrl: 'xxxxxxx/h320.jpg',
      lanPorts: [
        {
          defaultType: 'ACCESS',
          id: '1',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1'
        },
        {
          defaultType: 'ACCESS',
          id: '2',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1'
        },
        {
          defaultType: 'TRUNK',
          id: '3',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: true,
          untagId: 1,
          vlanMembers: '1-4094'
        }
      ]
    },
    {
      ledOn: true,
      model: 'T750',
      canSupportPoeMode: true,
      canSupportPoeOut: true,
      lanPortPictureDownloadUrl: 'xxxxxxx/t750.jpg',
      lanPorts: [
        {
          defaultType: 'TRUNK',
          id: '1',
          isPoeOutPort: true,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        },
        {
          defaultType: 'TRUNK',
          id: '2',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        },
        {
          defaultType: 'TRUNK',
          id: '3',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }
      ],
      poeModeCapabilities: [
        'Auto',
        '802.3at',
        '802.3bt-Class_5',
        '802.3bt-Class_6',
        '802.3bt-Class_7'
      ]
    },
    {
      allowDfsCountry: ['US', 'SG'],
      canSupportCellular: true,
      canSupportLacp: false,
      canSupportPoeMode: true,
      canSupportPoeOut: false,
      capabilityScore: 79,
      has160MHzChannelBandwidth: false,
      isOutdoor: false,
      lanPortPictureDownloadUrl: 'xxxxxxx/m510.jpg',
      lanPorts: [
        {
          id: '1',
          displayLabel: 'WAN',
          defaultType: 'TRUNK',
          untagId: 1,
          vlanMembers: '1-4094'
        }
      ],
      ledOn: true,
      lldpAdInterval: 30,
      lldpEnable: true,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      model: 'M510',
      pictureDownloadUrl: 'xxxxxx',
      poeModeCapabilities: ['Auto', '802.3af', '802.3at'],
      primaryWanRecoveryTimer: 60,
      requireOneEnabledTrunkPort: true,
      simCardPrimaryApn: 'defaultapn',
      simCardPrimaryCellularNetworkSelection: 'AUTO',
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryApn: 'defaultapn',
      simCardSecondaryCellularNetworkSelection: 'AUTO',
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      support11AX: false,
      supportChannel144: true,
      supportDual5gMode: false,
      supportTriRadio: false,
      wanConnection: 'ETH_WITH_CELLULAR_FAILOVER'
    },
    {
      model: 'R650',lanPorts: [
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
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/',
      pictureDownloadUrl:
        'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 140,
      supportTriRadio: true,
      supportDual5gMode: true,
      supportChannel144: true,
      support11AX: true,
      maxChannelization24G: 40,
      maxChannelization5G: 160,
      supportMesh: true
    }
  ],
  version: '6.0.0.x.xxx'
}
export const apGroupApCaps = venueCaps

export const mockApModelFamilies: ApModelFamily[] = [{
  name: ApModelFamilyType.WIFI_11AC_1,
  displayName: '11ac wave 1',
  apModels: [
    'R730', 'R310', 'T300', 'T301N',
    'T300E', 'R500', 'R600', 'T301S'
  ]
}, {
  name: ApModelFamilyType.WIFI_11AC_2,
  displayName: '11ac wave 2',
  apModels: [
    'H510', 'R510', 'M510', 'T710',
    'T310S', 'T610', 'T310N', 'T710S',
    'R710', 'R320', 'T310C', 'R720',
    'T610S', 'T310D', 'E510', 'H320',
    'R610'
  ]
}, {
  name: ApModelFamilyType.WIFI_6,
  displayName: 'Wi-Fi 6',
  apModels: [
    'R750', 'R850', 'T750SE', 'T350SE',
    'T750', 'R350:R350E', 'T350C', 'T350D',
    'R350', 'R650', 'R550', 'H350', 'H550'
  ]
}, {
  name: ApModelFamilyType.WIFI_6E,
  displayName: 'Wi-Fi 6E',
  apModels: [ 'R760', 'R560' ]
}, {
  name: ApModelFamilyType.WIFI_7,
  displayName: 'Wi-Fi 7',
  apModels: [ 'R770', 'H670', 'T670SN', 'T670', 'R670']
}]

export const apCaps = {
  apModels: [
    {
      model: 'E510'
    },
    {
      model: 'H320'
    },
    {
      model: 'R650'
    }
  ],
  version: '6.0.0.x.xxx'
}

export const aplist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'mock-ap',
      serialNumber: '125488555569',
      venueId: '52001e212a02484e815a8cadf0024f2b'
    },
    {
      name: 'mock-ap2',
      serialNumber: '150000000761',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b'
    }
  ]
}

export const apGrouplist = [
  {
    id: 'f9903daeeadb4af88969b32d185cbf27',
    isDefault: true,
    venueId: '2c16284692364ab6a01f4c60f5941836'
  },
  {
    id: '9095a8cf11c845a9afe4d3643c46a44d',
    isDefault: false,
    name: 'testgroup',
    venueId: '7ae27179b7b84de89eb7e56d9b15943d'
  }
]

export const apDetailsList = [
  {
    apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
    clientCount: 0,
    indoorModel: false,
    lastUpdated: '2022-07-05T08:29:15.484Z',
    mac: '456789876554',
    meshRole: 'DISABLED',
    model: 'R650',
    name: 'test ap',
    position: { xPercent: 0, yPercent: 0 },
    radio: {
      apRadioParams24G: {
        changeInterval: 33,
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        method: 'BACKGROUND_SCANNING',
        operativeChannel: 0,
        snr_dB: 0,
        txPower: 'MAX'
      },
      apRadioParams50G: {
        changeInterval: 33,
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        method: 'BACKGROUND_SCANNING',
        operativeChannel: 0,
        snr_dB: 0,
        txPower: 'MAX'
      },
      useVenueSettings: true
    },
    serialNumber: '456789876554',
    softDeleted: false,
    state: 'InSetupPhase',
    subState: 'NeverContactedCloud',
    updatedDate: '2022-07-05T08:29:15.484+0000',
    uptime_seconds: 0,
    venueId: '908c47ee1cd445838c3bf71d4addccdf'
  },
  {
    apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
    clientCount: 0,
    description: 'yyy',
    externalIp: '210.58.90.254',
    firmware: '6.2.0.103.500',
    indoorModel: true,
    ip: '10.206.1.16',
    lastContacted: '2022-11-08T07:55:12.936Z',
    lastUpdated: '2022-11-08T06:18:21.378Z',
    mac: '28:B3:71:28:6C:10',
    meshRole: 'DISABLED',
    model: 'R650',
    name: 'UI team ONLY',
    radio: {
      apRadioParams24G: {
        changeInterval: 33,
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        method: 'BACKGROUND_SCANNING',
        operativeChannel: 0,
        snr_dB: 0,
        txPower: 'MAX'
      },
      apRadioParams50G: {
        changeInterval: 33,
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        method: 'BACKGROUND_SCANNING',
        operativeChannel: 0,
        snr_dB: 0,
        txPower: 'MAX'
      },
      useVenueSettings: true
    },
    serialNumber: '422039000034',
    softDeleted: false,
    state: 'Operational',
    subState: 'Operational',
    updatedDate: '2022-11-08T06:18:21.378+0000',
    uptime_seconds: 684831,
    venueId: '16b11938ee934928a796534e2ee47661'
  }
]

export const dhcpAp = [
  {
    requestId: '3be06d50-5ae9-4d7f-92b6-146b5b7d77b4',
    response: [
      {
        dhcpApRole: 'PrimaryServer',
        serialNumber: '422039000034',
        venueDhcpEnabled: true,
        venueDhcpMode: 'EnableOnMultipleAPs',
        venueId: 'a4f9622e9c7547ba934fbb5ee55646c2'
      }
    ]
  },
  {
    requestId: '3be06d50-5ae9-4d7f-92b6-146b5b7d77b4',
    response: [
      {
        dhcpApRole: 'BackupServer',
        serialNumber: '422039000034',
        venueDhcpEnabled: true,
        venueDhcpMode: 'EnableOnMultipleAPs',
        venueId: '16b11938ee934928a796534e2ee47661'
      }
    ]
  }
]

export const r650ap = {
  serialNumber: '422039000034',
  apGroupId: '9150b159b5f748a1bbf55dab35a60bce',
  venueId: '4c778ed630394b76b17bce7fe230cf9f',
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
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
    useVenueSettings: true
  },
  name: 'UI team AP',
  softDeleted: false,
  model: 'R650',
  position: {
    xPercent: 0.0,
    yPercent: 0.0
  },
  updatedDate: '2022-11-22T08:53:27.329+0000'
}

export const r650Cap = {
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
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/',
      pictureDownloadUrl:
        'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/',
      canSupportCellular: false,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      capabilityScore: 140,
      supportTriRadio: true,
      supportDual5gMode: true,
      supportChannel144: true,
      support11AX: true,
      maxChannelization24G: 40,
      maxChannelization5G: 160,
      supportMesh: true
    }
  ]
}

export const r760Ap = {
  serialNumber: '392172001829',
  apGroupId: 'c4d022174e8347a0b2c5a52fa11eb85a',
  venueId: '4910e33b100d42da97fba46d89a8fc0f',
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
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
    useVenueSettings: true
  },
  name: 'R760-eric',
  softDeleted: false,
  model: 'R760',
  updatedDate: '2022-11-30T01:46:54.199+0000'
}

export const r560Ap = {
  serialNumber: '472106000021',
  apGroupId: 'd88ed8e79740473e904165bddf665192',
  venueId: '4910e33b100d42da97fba46d89a8fc0f',
  bonjourGateway: {
    rules: [
      {
        enabled: true,
        service: 'ICLOUD_SYNC',
        fromVlan: 5,
        toVlan: 10
      }
    ]
  },
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
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
    useVenueSettings: true
  },
  name: 'R560-eric',
  softDeleted: false,
  model: 'R560',
  updatedDate: '2022-12-20T07:51:25.612+0000'
}

export const triBandApCap = {
  apModels: [
    { model: 'R560',
      allowCbandCountry: ['GB'],
      allowDfsCountry: ['US', 'SG'],
      canSupportCellular: false,
      canSupportLacp: true,
      canSupportPoeMode: true,
      canSupportPoeOut: false,
      capabilityScore: 288,
      has160MHzChannelBandwidth: true,
      isOutdoor: false,
      lanPortPictureDownloadUrl:
        'https://fakeLanportPic/wifi/firmware/6.2.0.99.1486/r560.jpg',
      lanPorts: [
        {
          id: '1',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }, {
          id: '2',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'

        }
      ],
      ledOn: true,
      lldpAdInterval: 30,
      lldpEnable: true,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      maxChannelization5G: 80,
      maxChannelization6G: 160,
      maxChannelization24G: 40,
      pictureDownloadUrl:
        'https://fakeApPic/wifi/firmware/6.2.0.99.1486/r560.jpg',
      poeModeCapabilities: ['Auto', '802.3at', '802.3bt-Class_5'],
      requireOneEnabledTrunkPort: true,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      support11AX: true,
      support11BE: false,
      supportChannel144: true,
      supportDual5gMode: false,
      supportTriRadio: true,
      supportMesh: true,
      version: '6.2.1.103.2554'
    },
    { model: 'R760',
      allowCbandCountry: ['GB'],
      allowDfsCountry: ['US', 'SG'],
      canSupportCellular: false,
      canSupportLacp: true,
      canSupportPoeMode: true,
      canSupportPoeOut: false,
      capabilityScore: 288,
      has160MHzChannelBandwidth: true,
      isOutdoor: false,
      lanPortPictureDownloadUrl:
        'https://fakeLanPortPic/wifi/firmware/6.2.0.99.1486/r760.jpg',
      lanPorts: [
        {
          id: '1',
          defaultTyp: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: false,
          supportDisable: true,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }, {
          id: '2',
          defaultType: 'TRUNK',
          isPoeOutPort: false,
          isPoePort: true,
          supportDisable: false,
          trunkPortOnly: false,
          untagId: 1,
          vlanMembers: '1-4094'
        }
      ],
      ledOn: true,
      lldpAdInterval: 30,
      lldpEnable: true,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      maxChannelization5G: 160,
      maxChannelization6G: 160,
      maxChannelization24G: 40,
      pictureDownloadUrl:
        'https://fakeApPic/wifi/firmware/6.2.0.99.1486/r760.jpg',
      poeModeCapabilities: ['Auto', '802.3at', '802.3bt-Class_5'],
      requireOneEnabledTrunkPort: true,
      simCardPrimaryEnabled: true,
      simCardPrimaryRoaming: true,
      simCardSecondaryEnabled: true,
      simCardSecondaryRoaming: true,
      support11AX: true,
      supportChannel144: true,
      supportDual5gMode: true,
      supportTriRadio: true,
      supportMesh: true,
      version: '6.2.1.103.2554'
    }
  ]
}

export const apRadio = {
  apRadioParams24G: {
    manualChannel: 0,
    allowedChannels: ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11'],
    channelBandwidth: '20MHz',
    txPower: 'MAX',
    method: 'CHANNELFLY',
    changeInterval: 52
  },
  apRadioParams50G: {
    allowedChannels: [
      '36',
      '40',
      '44',
      '48',
      '52',
      '56',
      '100',
      '104',
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
    method: 'CHANNELFLY',
    changeInterval: 33
  },
  apRadioParamsDual5G: {
    enabled: true,
    lower5gEnabled: true,
    upper5gEnabled: true,
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
  enable6G: true,
  useVenueSettings: true,
  enable24G: true,
  enable50G: true
}

export const apLanPort = {
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
  useVenueSettings: false
}

export const apLanPorts = [
  {
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
]

export const venueSetting = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  wifiFirmwareVersion: '6.2.0.103.486',
  countryCode: 'US',
  mesh: {
    enabled: true
  },
  bandBalancing: {
    enabled: false,
    clientPercent24: 25
  },
  radioCustomization: {
    radioParams6G: {
      method: 'CHANNELFLY',
      scanInterval: 20,
      allowedChannels: [
        '1', '5', '9', '13',
        '17', '21', '25', '29',
        '33', '37', '41', '45',
        '49', '53', '57', '61',
        '65', '69', '73', '77',
        '81', '85', '89', '93',
        '97', '101', '105', '109',
        '113', '117', '121', '125',
        '129', '133', '137', '141',
        '145', '149', '153', '157',
        '161', '165', '169', '173',
        '177', '181', '185', '189',
        '193', '197', '201', '205',
        '209', '213', '217', '221'
      ],
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      changeInterval: 33,
      txPower: 'MAX'
    },
    radioParamsDual5G: {
      inheritParamsLower5G: true,
      radioParamsLower5G: {
        allowedIndoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
        allowedOutdoorChannels: [
          '36', '40', '44', '48', '52', '56', '60', '64'
        ],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      },
      inheritParamsUpper5G: true,
      radioParamsUpper5G: {
        // eslint-disable-next-line max-len
        allowedIndoorChannels: [
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
          '149',
          '153',
          '157',
          '161'
        ],
        // eslint-disable-next-line max-len
        allowedOutdoorChannels: [
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
          '149',
          '153',
          '157',
          '161'
        ],
        channelBandwidth: 'AUTO',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33,
        scanInterval: 20,
        txPower: 'MAX'
      }
    },
    radioParams24G: {
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
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    },
    radioParams50G: {
      combineChannels: false,
      // eslint-disable-next-line max-len
      allowedIndoorChannels: [
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
        '149',
        '153',
        '157',
        '161'
      ],
      // eslint-disable-next-line max-len
      allowedOutdoorChannels: [
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
        '149',
        '153',
        '157',
        '161'
      ],
      channelBandwidth: 'AUTO',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20,
      txPower: 'MAX'
    }
  },
  denialOfServiceProtection: {
    enabled: false,
    blockingPeriod: 60,
    failThreshold: 5,
    checkPeriod: 30
  },
  syslog: {
    enabled: false,
    port: 514,
    facility: 'KEEP_ORIGINAL',
    priority: 'INFO',
    protocol: 'UDP',
    flowLevel: 'CLIENT_FLOW',
    secondaryPort: 514,
    secondaryProtocol: 'TCP'
  },
  dhcpServiceSetting: {
    enabled: false,
    mode: 'EnableOnEachAPs',
    wanPortSelectionMode: 'Dynamic'
  },
  rogueAp: {
    enabled: false,
    reportThreshold: 0
  },
  enableClientIsolationAllowlist: false,
  id: 'f892848466d047798430de7ac234e940'
}

export const venueLanPorts = [
  {
    lanPorts: [
      {
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '1',
        enabled: true
      }
    ],
    model: 'E510'
  },
  {
    lanPorts: [
      {
        type: 'ACCESS',
        untagId: 1,
        vlanMembers: '1',
        portId: '1',
        enabled: false
      },
      {
        type: 'ACCESS',
        untagId: 1,
        vlanMembers: '1',
        portId: '2',
        enabled: true
      },
      {
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '3',
        enabled: true
      }
    ],
    model: 'H320'
  },
  {
    lanPorts: [
      {
        defaultType: 'TRUNK',
        id: '1',
        isPoeOutPort: false,
        isPoePort: false,
        supportDisable: true,
        trunkPortOnly: false,
        untagId: 1,
        vlanMembers: '1-4094'
      },
      {
        defaultType: 'TRUNK',
        id: '2',
        isPoeOutPort: false,
        isPoePort: true,
        supportDisable: false,
        trunkPortOnly: false,
        untagId: 1,
        vlanMembers: '1-4094'
      }
    ],
    model: 'R650'
  },
  {
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
      },
      {
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '3',
        enabled: true
      }
    ],
    model: 'T750',
    poeMode: 'Auto',
    poeOut: false
  }
]

export const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '2022-07-08T04:59:22.351+00:00',
  description: 'My-Venue',
  floorPlans: [],
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My-Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}

export const ApLanPorts_T750SE = {
  poeMode: 'Auto',
  poeOut: false,
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
    },
    {
      type: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '3',
      enabled: true
    }
  ],
  useVenueSettings: true
}

export const ApData_T750SE = {
  apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
  venueId: 'venue-id',
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
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
      channelBandwidth320MhzGroup: 'AUTO',
      method: 'CHANNELFLY',
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      txPower: 'MAX',
      enableMulticastUplinkRateLimiting: false,
      multicastUplinkRateLimiting: 1,
      enableMulticastDownlinkRateLimiting: false,
      multicastDownlinkRateLimiting: 1,
      changeInterval: 33
    },
    useVenueSettings: true
  },
  name: 'T750SE',
  softDeleted: false,
  model: 'T750SE',
  bssColoring: {
    useVenueSettings: true
  }
}

export const ApCap_T750SE = {
  externalAntenna: {
    enable24G: false,
    enable50G: false,
    gain24G: 8,
    gain50G: 8,
    supportDisable: true,
    coupled: true
  },
  model: 'T750SE',
  version: '7.0.0.103.390',
  lanPorts: [
    {
      id: '1',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: true,
      isPoePort: false,
      isPoeOutPort: true
    },
    {
      id: '2',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      trunkPortOnly: false,
      supportDisable: true,
      isPoePort: false,
      isPoeOutPort: false
    },
    {
      id: '3',
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
  isOutdoor: true,
  has160MHzChannelBandwidth: true,
  canSupportPoeOut: true,
  canSupportPoeMode: true,
  canSupportLacp: true,
  requireOneEnabledTrunkPort: true,
  poeModeCapabilities: [
    'Auto',
    '802.3at',
    '802.3bt-Class_5',
    '802.3bt-Class_6',
    '802.3bt-Class_7'
  ],
  lanPortPictureDownloadUrl: 'https://fakeURL/7.0.0.103.390/t750se.jpg',
  pictureDownloadUrl: 'https://fakeUrl/7.0.0.103.390/appearance-t750se.jpg',
  canSupportCellular: false,
  simCardPrimaryEnabled: true,
  simCardPrimaryRoaming: true,
  simCardSecondaryEnabled: true,
  simCardSecondaryRoaming: true,
  capabilityScore: 288,
  supportTriRadio: false,
  supportDual5gMode: false,
  supportChannel144: true,
  support11AX: true,
  support11BE: false,
  maxChannelization24G: 40,
  maxChannelization5G: 160,
  supportMesh: true
}

export const apDeviceRadio = {
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
      '36', '40', '44', '48',
      '52', '56', '60', '64',
      '100','104', '108', '112',
      '116', '120', '124', '128',
      '132', '136', '140', '144',
      '149', '153', '157', '161'
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
        '100', '104', '108', '112',
        '116', '120', '124', '128',
        '132', '136', '140', '144',
        '149', '153', '157', '161'
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
      '1', '5', '9', '13',
      '17', '21', '25', '29',
      '33', '37', '41', '45',
      '49', '53', '57', '61',
      '65', '69', '73', '77',
      '81', '85', '89', '93',
      '97', '101', '105', '109',
      '113', '117', '121', '125',
      '129', '133', '137', '141',
      '145', '149', '153', '157',
      '161', '165', '169', '173',
      '177', '181', '185', '189',
      '193', '197', '201', '205',
      '209', '213', '217', '221'
    ],
    channelBandwidth: 'AUTO',
    bssMinRate6G: 'HE_MCS_0',
    mgmtTxRate6G: '6',
    txPower: 'MAX',
    changeInterval: 33
  },
  enable6G: false,
  useVenueSettings: false,
  enable24G: true,
  enable50G: true
}

export const apR760DeviceRadio = {
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
      '36', '40', '44', '48',
      '52', '56', '60', '64',
      '100','104', '108', '112',
      '116', '120', '124', '128',
      '132', '136', '140', '144',
      '149', '153', '157', '161'
    ],
    channelBandwidth: 'AUTO',
    manualChannel: 0,
    txPower: 'MAX',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33
  },
  apRadioParamsDual5G: {
    enabled: true,
    lower5gEnabled: true,
    upper5gEnabled: true,
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
        '100', '104', '108', '112',
        '116', '120', '124', '128',
        '132', '136', '140', '144',
        '149', '153', '157', '161'
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
      '1', '5', '9', '13',
      '17', '21', '25', '29',
      '33', '37', '41', '45',
      '49', '53', '57', '61',
      '65', '69', '73', '77',
      '81', '85', '89', '93',
      '97', '101', '105', '109',
      '113', '117', '121', '125',
      '129', '133', '137', '141',
      '145', '149', '153', '157',
      '161', '165', '169', '173',
      '177', '181', '185', '189',
      '193', '197', '201', '205',
      '209', '213', '217', '221'
    ],
    channelBandwidth: 'AUTO',
    bssMinRate6G: 'HE_MCS_0',
    mgmtTxRate6G: '6',
    txPower: 'MAX',
    changeInterval: 33
  },
  enable6G: true,
  useVenueSettings: false,
  enable24G: true,
  enable50G: true
}

export const apRadioDetail = {
  serialNumber: '422039000034',
  apGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
  venueId: '16b11938ee934928a796534e2ee47661',
  lanPorts: {
    lanPorts: [
      {
        type: 'ACCESS',
        untagId: 3,
        vlanMembers: '3',
        portId: '1',
        enabled: false
      },
      {
        type: 'TRUNK',
        untagId: 1,
        vlanMembers: '1-4094',
        portId: '2',
        enabled: true
      }
    ],
    useVenueSettings: false
  },
  bonjourGateway: {
    rules: [
      { enabled: true, service: 'AIRTUNES', fromVlan: 33, toVlan: 22 },
      { enabled: true, service: 'AIRDISK', fromVlan: 1, toVlan: 3 }
    ]
  },
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      operativeTxPower: '0 dB',
      operativeChannel: 0,
      snr_dB: 0,
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
      operativeTxPower: '0 dB',
      operativeChannel: 0,
      snr_dB: 0,
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
  },
  clientCount: 0,
  lastContacted: '2022-11-15T08:25:55.069Z',
  lastUpdated: '2022-11-16T06:32:45.268Z',
  indoorModel: true,
  firmware: '6.2.0.103.508',
  state: 'RequiresAttention',
  subState: 'DisconnectedFromCloud',
  mac: '28:B3:71:28:6C:10',
  ip: '10.206.1.16',
  externalIp: '210.58.90.254',
  meshRole: 'DISABLED',
  uptime_seconds: 174308,
  name: 'UI team ONLY',
  description: 'test',
  softDeleted: false,
  model: 'R650',
  updatedDate: '2022-11-16T08:27:35.647+0000'
}

export const venueRadioDetail = {
  id: '16b11938ee934928a796534e2ee47661',
  createdDate: '2022-11-02T10:43:27.921+00:00',
  updatedDate: '2022-11-02T10:43:27.921+00:00',
  name: 'venue-dhcp-ui',
  address: {
    country: 'United States',
    city: 'Sunnyvale, California',
    addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
    latitude: 37.4112751,
    longitude: -122.0191908,
    timezone: 'America/Los_Angeles'
  }
}

export const apGroupValidRadioChannels = {
  'afcEnabled': false,
  '2.4GChannels': {
    'auto': [
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
    '20MHz': [
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
    '40MHz': [
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
    ]
  },
  '5GChannels': {
    indoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
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
        '128'
      ]
    },
    outdoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
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
        '128'
      ]
    },
    dfs: {
      'auto': [
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
        '144'
      ],
      '20MHz': [
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
        '144'
      ],
      '40MHz': [
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
        '144'
      ],
      '80MHz': [
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
        '144'
      ],
      '160MHz': [
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
        '140'
      ]
    },
    indoorForOutdoorAp: {}
  },
  '5GLowerChannels': {
    indoor: {
      'auto': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '20MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '40MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '80MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '160MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ]
    },
    outdoor: {
      'auto': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '20MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '40MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '80MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ],
      '160MHz': [
        '36',
        '40',
        '44',
        '48',
        '52',
        '56',
        '60',
        '64'
      ]
    },
    dfs: {
      'auto': [
        '52',
        '56',
        '60',
        '64'
      ],
      '20MHz': [
        '52',
        '56',
        '60',
        '64'
      ],
      '40MHz': [
        '52',
        '56',
        '60',
        '64'
      ],
      '80MHz': [
        '52',
        '56',
        '60',
        '64'
      ],
      '160MHz': [
        '52',
        '56',
        '60',
        '64'
      ]
    }
  },
  '5GUpperChannels': {
    indoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128'
      ]
    },
    outdoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
        '100',
        '104',
        '108',
        '112',
        '116',
        '120',
        '124',
        '128'
      ]
    },
    dfs: {
      'auto': [
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
        '144'
      ],
      '20MHz': [
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
        '144'
      ],
      '40MHz': [
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
        '144'
      ],
      '80MHz': [
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
        '144'
      ],
      '160MHz': [
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
        '140'
      ]
    }
  },
  '6GChannels': {
    'auto': [
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
    'indoor': {
      'auto': [
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
      '20MHz': [
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
        '221',
        '225',
        '229',
        '233'
      ],
      '40MHz': [
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
        '221',
        '225',
        '229'
      ],
      '80MHz': [
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
      '160MHz': [
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
      ]
    },
    '20MHz': [
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
      '221',
      '225',
      '229',
      '233'
    ],
    '40MHz': [
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
      '221',
      '225',
      '229'
    ],
    '80MHz': [
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
    '160MHz': [
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
    ]
  }
}

export const validRadioChannels = {
  '2.4GChannels': {
    'auto': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    '20MHz': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    '40MHz': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
  },
  '5GChannels': {
    indoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
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
        '128'
      ]
    },
    outdoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': [
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
        '128'
      ]
    },
    dfs: {
      'auto': [
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
        '144'
      ],
      '20MHz': [
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
        '144'
      ],
      '40MHz': [
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
        '144'
      ],
      '80MHz': [
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
        '144'
      ],
      '160MHz': [
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
        '140'
      ]
    },
    indoorForOutdoorAp: {}
  },
  '5GLowerChannels': {
    indoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    outdoor: {
      'auto': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '20MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '40MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '80MHz': ['36', '40', '44', '48', '52', '56', '60', '64'],
      '160MHz': ['36', '40', '44', '48', '52', '56', '60', '64']
    },
    dfs: {
      'auto': ['52', '56', '60', '64'],
      '20MHz': ['52', '56', '60', '64'],
      '40MHz': ['52', '56', '60', '64'],
      '80MHz': ['52', '56', '60', '64'],
      '160MHz': ['52', '56', '60', '64']
    }
  },
  '5GUpperChannels': {
    indoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    outdoor: {
      'auto': [
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
      '20MHz': [
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
        '161',
        '165'
      ],
      '40MHz': [
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
      '80MHz': [
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
      '160MHz': ['100', '104', '108', '112', '116', '120', '124', '128']
    },
    dfs: {
      'auto': [
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
        '144'
      ],
      '20MHz': [
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
        '144'
      ],
      '40MHz': [
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
        '144'
      ],
      '80MHz': [
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
        '144'
      ],
      '160MHz': [
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
        '140'
      ]
    }
  },
  '6GChannels': {
    'auto': [
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
    '20MHz': [
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
      '221',
      '225',
      '229',
      '233'
    ],
    '40MHz': [
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
      '221',
      '225',
      '229'
    ],
    '80MHz': [
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
    '160MHz': [
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
    ]
  }
}

export const venueRadioCustomization = {
  radioParams6G: {
    method: 'CHANNELFLY',
    scanInterval: 10,
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
  radioParamsDual5G: {
    enabled: false,
    inheritParamsLower5G: true,
    radioParamsLower5G: {
      allowedIndoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      allowedOutdoorChannels: ['36', '40', '44', '48', '52', '56', '60', '64'],
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20
    },
    inheritParamsUpper5G: true,
    radioParamsUpper5G: {
      allowedIndoorChannels: [
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
      allowedOutdoorChannels: [
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
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33,
      scanInterval: 20
    }
  },
  radioParams24G: {
    allowedChannels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
    channelBandwidth: 'AUTO',
    txPower: 'MAX',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20
  },
  radioParams50G: {
    combineChannels: false,
    allowedIndoorChannels: [
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
    allowedOutdoorChannels: [
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
    channelBandwidth: '80MHz',
    txPower: 'MAX',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20
  }
}

export const apGroupRadioCustomization = {
  radioParams24G: {
    allowedChannels: [
      '1',
      '2'
    ],
    channelBandwidth: 'AUTO',
    method: 'BACKGROUND_SCANNING',
    changeInterval: 33,
    scanInterval: 20,
    txPower: 'MAX',
    useVenueSettings: true,
    enabled: true
  }
}

export const deviceAps = {
  fields: [
    'isMeshEnable',
    'apUpRssi',
    'description',
    'deviceStatus',
    'meshRole',
    'apStatusData.APSystem.uptime',
    'uplink',
    'deviceGroupId',
    'deviceStatusSeverity',
    'venueId',
    'deviceGroupName',
    'model',
    'fwVersion',
    'lastSeenTime',
    'serialNumber',
    'IP',
    'apMac',
    'lastUpdTime',
    'extIp',
    'tags',
    'venueName',
    'deviceModelType',
    'name',
    'hops',
    'apStatusData.cellularInfo',
    'apStatusData'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '422039000034',
      lastUpdTime: '2022-12-07T02:32:29.816Z',
      lastSeenTime: '2022-12-07T08:28:09.161Z',
      name: 'UI team AP',
      model: 'R650',
      fwVersion: '6.2.0.103.513',
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      venueName: 'My-Venue',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      IP: '10.206.1.16',
      extIp: '210.58.90.254',
      apMac: '28:B3:71:28:6C:10',
      apStatusData: {
        APRadio: [
          {
            txPower: 'max',
            channel: 11,
            band: '2.4G',
            Rssi: null,
            operativeChannelBandwidth: '20',
            radioId: 0
          },
          {
            txPower: 'max',
            channel: 116,
            band: '5G',
            Rssi: null,
            operativeChannelBandwidth: '80',
            radioId: 1
          }
        ],
        APSystem: { uptime: 1294308 },
        lanPortStatus: [
          { port: '0', phyLink: 'Down  ' },
          { port: '1', phyLink: 'Up 1000Mbps full' }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      tags: '',
      deviceGroupName: '',
      deviceModelType: 'Indoor'
    }
  ]
}

export const portlistData = {
  data: [{
    adminStatus: 'Up',
    broadcastIn: '436434',
    broadcastOut: '2432',
    cloudPort: true,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-10_1-1-1',
    inDiscard: '0',
    inErr: '0',
    lagId: '0',
    lagName: '',
    multicastIn: '348193',
    multicastOut: '19730',
    name: 'GigabitEthernet1/1/1',
    neighborName: 'HP1920S_6F_DC_F3_8U_10.206.2.4',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 0,
    portId: '38-45-3b-3b-b8-10_1-1-1',
    portIdentifier: '1/1/1',
    portSpeed: '1 Gb/sec',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Up',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1'
  }, {
    adminStatus: 'Up',
    broadcastIn: '0',
    broadcastOut: '0',
    cloudPort: false,
    crcErr: '0',
    deviceStatus: 'ONLINE',
    id: '38-45-3b-3b-b8-11_1-1-2',
    inDiscard: '0',
    inErr: '0',
    lagId: '1',
    lagName: 'test1',
    multicastIn: '0',
    multicastOut: '0',
    name: 'GigabitEthernet1/1/2',
    neighborName: '',
    opticsType: '1 Gbits per second copper',
    outErr: '0',
    poeEnabled: true,
    poeTotal: 0,
    poeType: 'n/a',
    poeUsed: 0,
    portId: '38-45-3b-3b-b8-11_1-1-2',
    portIdentifier: '1/1/2',
    portSpeed: 'link down or no traffic',
    signalIn: 0,
    signalOut: 0,
    stack: false,
    status: 'Down',
    switchMac: '38:45:3b:3b:b8:10',
    switchModel: 'ICX7650-48ZP',
    switchName: 'ICX7650-48ZP Router',
    switchSerial: '38:45:3b:3b:b8:10',
    switchUnitId: 'EZC4312T00C',
    syncedSwitchConfig: true,
    unTaggedVlan: '1',
    unitState: 'ONLINE',
    unitStatus: 'Standalone',
    usedInFormingStack: false,
    vlanIds: '1'
  }],
  page: 1,
  totalCount: 2
}

export const resultOfGetApSnmpAgentSettings = {
  apSnmpAgentProfileId: 'c1082e7d05d74eb897bb3600a15c1dc7',
  useVenueSettings: true,
  enableApSnmp: true
}

export const resultOfGetVenueApSnmpAgentSettings = {
  apSnmpAgentProfileId: 'c1082e7d05d74eb897bb3600a15c1dc7',
  enableApSnmp: true
}

export const resultOfUpdateApSnmpAgentSettings
= { requestId: '5aa421fd-25e9-4952-b3e0-a3a39c9a52bb' }

export const resultOfGetApSnmpAgentProfiles = [
  {
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'test',
        readPrivilege: true,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '10.206.78.28',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'testUser',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '00000000',
        privacyProtocol: 'AES',
        privacyPassword: '00000000'
      }
    ],
    policyName: 'SNMP-1',
    id: 'c1082e7d05d74eb897bb3600a15c1dc7'
  },
  {
    tenantId: '3de62cf01fea4f75a00163cd5a6cd97d',
    snmpV2Agents: [
      {
        communityName: 'test',
        readPrivilege: true,
        trapPrivilege: true,
        notificationType: 'Trap',
        targetAddr: '10.206.78.28',
        targetPort: 162
      }
    ],
    snmpV3Agents: [
      {
        userName: 'testUser',
        readPrivilege: true,
        trapPrivilege: false,
        notificationType: 'Trap',
        targetPort: 162,
        authProtocol: 'SHA',
        authPassword: '00000000',
        privacyProtocol: 'AES',
        privacyPassword: '00000000'
      }
    ],
    policyName: 'SNMP-2',
    id: 'l8oz9aez7mbyxgdkktvruibnqcw03hfs'
  }
]

export const apViewModel: ApViewModel = {
  serialNumber: '',
  lastSeenTime: '2022-11-14T09:55:55.495Z',
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
    ],
    afcInfo: {
      powerMode: AFCPowerMode.LOW_POWER,
      afcStatus: AFCStatus.WAIT_FOR_LOCATION
    }
  },
  meshRole: 'DISABLED',
  deviceGroupId: 'be41e3513eb7446bbdebf461dec67ed3',
  tags: '',
  deviceGroupName: '',
  deviceModelType: '',
  password: 'admin!234',
  isMeshEnable: true
}
export const venueVersionList = [
  {
    id: '0842f2133565438d85e1e46103889744',
    name: 'Peter-Venue',
    apCount: 1,
    apModels: [
      'R750'
    ],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        category: 'RECOMMENDED'
      }
    ]
  },
  {
    id: '8ee8acc996734a5dbe43777b72469857',
    name: 'Ben-Venue-US',
    apCount: 1,
    apModels: [
      'R610'
    ],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.413',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['T300']
      }
    ],
    lastScheduleUpdate: '2023-02-18T01:07:33.203-08:00'
  },
  {
    id: '02b81f0e31e34921be5cf47e6dce1f3f',
    name: 'My-Venue',
    apCount: 0,
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.433',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['R300', 'R500', 'R550']
      },
      {
        name: 'eol-ap-2022-12',
        currentEolVersion: '6.2.0.103.533',
        latestEolVersion: '6.2.0.103.533',
        apCount: 1,
        apModels: ['R500']
      }
    ]
  }
]

export const oneApGroupList = {
  data: [{
    id: '58195e050b8a4770acc320f6233ad8d9',
    name: 'joe-test-apg',
    members: { count: 1, names: ['T750SE'] },
    networks: { count: 1, names: ['joe-psk'] },
    venueId: '991eb992ece042a183b6945a2398ddb9',
    venueName: 'joe-test'
  }],
  fields: ['venueName', 'venueId', 'members', 'name', 'id', 'networks'],
  page: 1,
  totalCount: 1
}

export const apGroupMembers = {
  data: [{
    deviceGroupId: '58195e050b8a4770acc320f6233ad8d9',
    deviceGroupName: 'joe-test-apg',
    deviceStatus: '1_09_Offline',
    fwVersion: '7.0.0.103.390',
    healthStatus: 'Poor',
    name: 'T750SE',
    serialNumber: '922102004888'
  }],
  fields: [
    'serialNumber',
    'deviceGroupId',
    'name',
    'deviceGroupName',
    'fwVersion',
    'id',
    'deviceStatus'
  ],
  page: 1,
  totalCount: 1
}

export const apGroupNetworkLinks = {
  data: [{
    clients: 0,
    id: '3c83529e839746ae960fa8fb6d4fd387',
    name: 'joe-psk',
    nwSubType: 'psk',
    ssid: 'joe-psk',
    vlan: 1
  }],
  page: 1,
  totalCount: 1
}

export const networkApGroup = {
  response: [{
    allApGroupsRadio: 'Both',
    apGroups: [{
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      apGroupName: 'joe-test-apg',
      id: 'f71c3dc400bb46e5a03662d48d0adb2c',
      isDefault: false,
      radio: 'Both',
      radioTypes: ['5-GHz', '2.4-GHz'],
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false,
      vlanPoolId: '545c8f5dd44f45c2b47f19f8db4f53dc',
      vlanPoolName: 'joe-vlanpool-1'
    }, {
      apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
      isDefault: true,
      radio: 'Both',
      validationError: false,
      validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
      validationErrorReachedMaxConnectedNetworksLimit: false,
      validationErrorSsidAlreadyActivated: false
    }],
    dual5gEnabled: false,
    isAllApGroups: false,
    networkId: '3c83529e839746ae960fa8fb6d4fd387',
    tripleBandEnabled: true,
    venueId: '991eb992ece042a183b6945a2398ddb9'
  }]
}

export const networkDeepList = {
  response: [{
    id: '3c83529e839746ae960fa8fb6d4fd387',
    name: 'joe-psk',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: 'psk',
    venues: [{
      allApGroupsRadio: 'Both',
      allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: 'f71c3dc400bb46e5a03662d48d0adb2c',
        isDefault: false,
        radio: 'Both',
        radioTypes: ['5-GHz', '2.4-GHz'],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        vlanPoolId: '545c8f5dd44f45c2b47f19f8db4f53dc',
        vlanPoolName: 'joe-vlanpool-1'
      }, {
        apGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
        isDefault: true,
        radio: 'Both',
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '54421058eb4c46f18cc30c9abc945510',
      isAllApGroups: false,
      networkId: '3c83529e839746ae960fa8fb6d4fd387',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      advancedCustomization: {
        accessControlEnable: false,
        agileMultibandEnabled: false,
        applicationPolicyEnable: false,
        arpRequestRateLimit: 15,
        broadcastProbeResponseDelay: 15,
        bssPriority: 'HIGH',
        centralizedForwardingEnabled: false,
        clientInactivityTimeout: 120,
        clientIsolation: false,
        clientIsolationOptions: { autoVrrp: false },
        clientLoadBalancingEnable: true,
        dhcpOption82Enabled: false,
        dhcpOption82MacFormat: 'COLON',
        dhcpOption82SubOption1Enabled: false,
        dhcpOption82SubOption2Enabled: false,
        dhcpOption82SubOption150Enabled: false,
        dhcpOption82SubOption151Enabled: false,
        dhcpRequestRateLimit: 15,
        directedThreshold: 5,
        dnsProxyEnabled: false,
        dtimInterval: 1,
        enableAdditionalRegulatoryDomains: true,
        enableAirtimeDecongestion: false,
        enableAntiSpoofing: false,
        enableApHostNameAdvertisement: false,
        enableArpRequestRateLimit: true,
        enableBandBalancing: true,
        enableDhcpRequestRateLimit: true,
        enableFastRoaming: false,
        enableGtkRekey: true,
        enableJoinRSSIThreshold: false,
        enableMulticastDownlinkRateLimiting: false,
        enableMulticastDownlinkRateLimiting6G: false,
        enableMulticastUplinkRateLimiting: false,
        enableMulticastUplinkRateLimiting6G: false,
        enableNeighborReport: true,
        enableOptimizedConnectivityExperience: false,
        enableSyslog: false,
        enableTransientClientManagement: false,
        forceMobileDeviceDhcp: false,
        hideSsid: false,
        joinExpireTime: 300,
        joinRSSIThreshold: -85,
        joinWaitThreshold: 10,
        joinWaitTime: 30,
        l2AclEnable: false,
        l3AclEnable: false,
        maxClientsOnWlanPerRadio: 100,
        mobilityDomainId: 1,
        multiLinkOperationEnabled: false,
        multiLinkOperationOptions: {
          enable24G: true,
          enable50G: true,
          enable6G: false
        },
        multicastDownlinkRateLimiting: 1,
        multicastFilterEnabled: false,
        multicastUplinkRateLimiting: 1,
        proxyARP: false,
        qosMapSetEnabled: false,
        qosMapSetOptions: {},
        qosMirroringEnabled: false,
        qosMirroringScope: 'MSCS_REQUESTS_ONLY',
        radioCustomization: {
          bssMinimumPhyRate: 'default',
          managementFrameMinimumPhyRate: '6',
          phyTypeConstraint: 'OFDM',
          rfBandUsage: 'BOTH'
        },
        radiusOptions: {
          calledStationIdType: 'BSSID',
          nasIdDelimiter: 'DASH',
          nasIdType: 'BSSID',
          nasMaxRetry: 2,
          nasReconnectPrimaryMin: 5,
          nasRequestTimeoutSec: 3,
          singleSessionIdAccounting: false
        },
        respectiveAccessControl: true,
        rssiAssociationRejectionThreshold: -75,
        totalDownlinkRateLimiting: 0,
        totalUplinkRateLimiting: 0,
        userDownlinkRateLimiting: 0,
        userUplinkRateLimiting: 0,
        wifi6Enabled: true,
        wifi7Enabled: true,
        wifiCallingEnabled: false
      },
      enabled: true,
      macAddressAuthentication: false,
      managementFrameProtection: 'Optional',
      passphrase: 'xxxxxxxxx',
      saePassphrase: 'xxxxxxxx',
      ssid: 'joe-psk',
      vlanId: 1,
      wlanSecurity: 'WPA23Mixed'
    }
  }]
}

export const vlanPoolList = [
  {
    id: 'e6842cfcf2e9423e9453dd4de84b29b3',
    name: 'joe-vlanpool-2',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    vlanMembers: ['20-30']
  }, {
    id: '545c8f5dd44f45c2b47f19f8db4f53dc',
    name: 'joe-vlanpool-1',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    vlanMembers: ['2-10']
  }
]

export const ApGroupNetworkTableData = [{
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    authRadius: {
      id: '140081aef2344707aaa6fbc6c795ce85',
      name: 'testRadius',
      primary: {
        ip: '1.1.1.1',
        port: 1812,
        sharedSecret: '12345678'
      },
      type: 'AUTHENTICATION'
    },
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: '27065090e000493396f9e044ea3eb207',
    name: 'joe-aaa',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.AAA,
    venues: [{
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '1de56a9c55e44291a9be7eb20e555299',
        isDefault: false,
        radio: RadioEnum.Both,
        radioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false,
        vlanId: 10
      }],
      dual5gEnabled: false,
      id: 'b1d329d47ef1436d8f9025af99854c3f',
      isAllApGroups: false,
      networkId: '27065090e000493396f9e044ea3eb207',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      managementFrameProtection: 'Disabled',
      ssid: 'joe-aaa',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.WPA2Enterprise
    }
  },
  id: '27065090e000493396f9e044ea3eb207',
  description: '',
  isAllApGroups: false,
  name: 'joe-aaa',
  nwSubType: 'aaa',
  ssid: 'joe-aaa',
  vlan: 10
}, {
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: 'd27ac21dba624ec2a1bc21e154b09a63',
    isOweMaster: false,
    name: 'joe-open',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.OPEN,
    venues: [{
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '19c1b37510f649a4beeb88569eacbc5c',
        isDefault: false,
        radio: RadioEnum.Both,
        radioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '4aa21b1f0381415ab39809f045681332',
      isAllApGroups: false,
      networkId: 'd27ac21dba624ec2a1bc21e154b09a63',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      macAddressAuthentication: false,
      ssid: 'joe-open',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.Open
    }
  },
  id: 'd27ac21dba624ec2a1bc21e154b09a63',
  description: '',
  isAllApGroups: false,
  isOweMaster: false,
  name: 'joe-open',
  nwSubType: 'open',
  ssid: 'joe-open',
  vlan: 1
}, {
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: '41daa5cf6f1046728f1c99772e035a11',
    isOweMaster: true,
    name: 'joe-open',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.OPEN,
    venues: [{
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '19c1b37510f649a4beeb88569eacbc5c',
        isDefault: false,
        radio: RadioEnum.Both,
        radioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '4aa21b1f0381415ab39809f045681332',
      isAllApGroups: false,
      networkId: '41daa5cf6f1046728f1c99772e035a11',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      macAddressAuthentication: false,
      ssid: 'joe-open',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.OWETransition
    }
  },
  id: '41daa5cf6f1046728f1c99772e035a11',
  description: '',
  isAllApGroups: false,
  isOweMaster: true,
  owePairNetworkId: '65abccab9f1e480cb806d10f08587e10',
  name: 'joe-open-owe-transition',
  nwSubType: 'open',
  ssid: 'joe-open-owe-transition',
  vlan: 1
}, {
  activated: {
    isActivated: true,
    isDisabled: false,
    errors: []
  },
  clients: 0,
  deepNetwork: {
    enableAccountingProxy: false,
    enableAuthProxy: false,
    id: '65abccab9f1e480cb806d10f08587e10',
    isOweMaster: true,
    name: 'joe-open',
    tenantId: 'b338eaa6796443829192a61093e143f9',
    type: NetworkTypeEnum.OPEN,
    venues: [{
      allApGroupsRadio: RadioEnum.Both,
      allApGroupsRadioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
      apGroups: [{
        apGroupId: '58195e050b8a4770acc320f6233ad8d9',
        apGroupName: 'joe-test-apg',
        id: '19c1b37510f649a4beeb88569eacbc5c',
        isDefault: false,
        radio: RadioEnum.Both,
        radioTypes: [RadioTypeEnum._5_GHz, RadioTypeEnum._2_4_GHz],
        validationError: false,
        validationErrorReachedMaxConnectedCaptiveNetworksLimit: false,
        validationErrorReachedMaxConnectedNetworksLimit: false,
        validationErrorSsidAlreadyActivated: false
      }],
      dual5gEnabled: false,
      id: '4aa21b1f0381415ab39809f045681332',
      isAllApGroups: false,
      networkId: '65abccab9f1e480cb806d10f08587e10',
      tripleBandEnabled: true,
      venueId: '991eb992ece042a183b6945a2398ddb9'
    }],
    wlan: {
      enabled: true,
      macAddressAuthentication: false,
      ssid: 'joe-open',
      vlanId: 10,
      wlanSecurity: WlanSecurityEnum.OWETransition
    }
  },
  id: '65abccab9f1e480cb806d10f08587e10',
  description: '',
  isAllApGroups: false,
  isOweMaster: false,
  owePairNetworkId: '41daa5cf6f1046728f1c99772e035a11',
  name: 'joe-open-owe-transition-owe-tr',
  nwSubType: 'open',
  ssid: 'joe-open-owe-transition-owe-tr',
  vlan: 1
}]

export const apGroupdeviceAps = {
  fields: [
    'isMeshEnable',
    'apUpRssi',
    'description',
    'deviceStatus',
    'meshRole',
    'apStatusData.APSystem.uptime',
    'uplink',
    'deviceGroupId',
    'deviceStatusSeverity',
    'venueId',
    'deviceGroupName',
    'model',
    'fwVersion',
    'lastSeenTime',
    'serialNumber',
    'IP',
    'apMac',
    'lastUpdTime',
    'extIp',
    'tags',
    'venueName',
    'deviceModelType',
    'name',
    'hops',
    'apStatusData.cellularInfo',
    'apStatusData'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      aps: [],
      serialNumber: '422039000034',
      lastUpdTime: '2022-12-07T02:32:29.816Z',
      lastSeenTime: '2022-12-07T08:28:09.161Z',
      name: 'UI team AP',
      model: 'R650',
      fwVersion: '6.2.0.103.513',
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      venueName: 'My-Venue',
      deviceStatus: '2_00_Operational',
      deviceStatusSeverity: '2_Operational',
      IP: '10.206.1.16',
      extIp: '210.58.90.254',
      apMac: '28:B3:71:28:6C:10',
      apStatusData: {
        APRadio: [
          {
            txPower: 'max',
            channel: 11,
            band: '2.4G',
            Rssi: null,
            operativeChannelBandwidth: '20',
            radioId: 0
          },
          {
            txPower: 'max',
            channel: 116,
            band: '5G',
            Rssi: null,
            operativeChannelBandwidth: '80',
            radioId: 1
          }
        ],
        APSystem: { uptime: 1294308 },
        lanPortStatus: [
          { port: '0', phyLink: 'Down  ' },
          { port: '1', phyLink: 'Up 1000Mbps full' }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '9150b159b5f748a1bbf55dab35a60bce',
      tags: '',
      deviceGroupName: '',
      deviceModelType: 'Indoor'
    }
  ]
}

export const tripleBandMode = {
  bandMode: 'TRIPLE',
  useVenueSettings: true
}

export const apGroupTripleBandMode = {
  apModelBandModeSettings: [{ model: 'R760', bandMode: 'TRIPLE' }],
  useVenueSettings: true
}

export const radioData = {
  radioParamsDual5G: {
    enabled: false,
    inheritParamsLower5G: true,
    radioParamsLower5G: {
      method: 'CHANNELFLY',
      changeInterval: 33,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      allowedIndoorChannels: [
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
      allowedOutdoorChannels: [
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
      ]
    },
    inheritParamsUpper5G: true,
    radioParamsUpper5G: {
      method: 'CHANNELFLY',
      changeInterval: 33,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      allowedIndoorChannels: [
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
      allowedOutdoorChannels: [
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
      ]
    }
  },
  radioParams24G: {
    useVenueSettings: true,
    method: 'CHANNELFLY',
    changeInterval: 33,
    channelBandwidth: 'AUTO',
    txPower: 'MAX',
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
    ]
  },
  radioParams50G: {},
  radioParams6G: {
    enableAfc: false
  }
}

export const mockedApModelFamilies = [
  {
    name: 'AC_WAVE1',
    displayName: '11ac wave 1',
    apModels: [
      'R600',
      'R500',
      'R310',
      'R730',
      'T300',
      'T300E',
      'T301N',
      'T301S'
    ]
  },
  {
    name: 'AC_WAVE2',
    displayName: '11ac wave 2',
    apModels: [
      'R720',
      'R710',
      'R610',
      'R510',
      'R320',
      'M510',
      'H510',
      'H320',
      'E510',
      'T710',
      'T710S',
      'T610',
      'T610S',
      'T310C',
      'T310D',
      'T310N',
      'T310S'
    ]
  },
  {
    name: 'WIFI_6',
    displayName: 'Wi-Fi 6',
    apModels: [
      'R850',
      'R750',
      'R650',
      'R550',
      'R350',
      'H550',
      'H350',
      'T750',
      'T750SE',
      'T350C',
      'T350D',
      'T350SE'
    ]
  },
  {
    name: 'WIFI_6E',
    displayName: 'Wi-Fi 6e',
    apModels: [
      'R560',
      'R760'
    ]
  },
  {
    name: 'WIFI_7',
    displayName: 'Wi-Fi 7',
    apModels: [
      'R770',
      'R670',
      'T670',
      'T670SN',
      'H670'
    ]
  }
]

