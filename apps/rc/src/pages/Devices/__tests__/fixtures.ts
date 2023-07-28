export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
  totalCount: 2,
  page: 1,
  data: [
    {
      country: 'United States',
      dhcp: { enabled: false, mode: 'DHCPMODE_EACH_AP' },
      enabled: false,
      mode: 'DHCPMODE_EACH_AP',
      id: '908c47ee1cd445838c3bf71d4addccdf',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'Test-Venue'
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
    enabled: false,
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
