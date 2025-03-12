/* eslint-disable max-len */
export const mockAPList = {
  fields: [
    'clients',
    'serialNumber',
    'lanPortStatuses',
    'radioStatuses',
    'networkStatus',
    'apGroupId',
    'tags',
    'uptime',
    'venueName',
    'meshRole',
    'macAddress',
    'switchName',
    'venueId',
    'name',
    'model',
    'firmwareVersion',
    'poePort',
    'status',
    'cellularStatus'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      serialNumber: '302002030366',
      name: 'mock-ap-1',
      apGroupId: 'f2863482681e489ab8566e2f229572aa',
      venueId: '0e2f68ab79154ffea64aa52c5cc48826',
      floorplanId: '94bed28abef24175ab58a3800d01e24a',
      tags: [
        ''
      ],
      model: 'R550',
      macAddress: '34:20:E3:1D:0C:50',
      firmwareVersion: '7.0.0.104.1432',
      uptime: 355845,
      status: '2_00_Operational',
      meshRole: 'DISABLED',
      networkStatus: {
        ipAddress: '10.206.78.138',
        externalIpAddress: '210.58.90.254',
        ipAddressType: 'dynamic',
        netmask: '255.255.254.0',
        gateway: '10.206.79.254',
        primaryDnsServer: '10.10.10.106',
        secondaryDnsServer: '10.10.10.10',
        managementTrafficVlan: 1
      },
      lanPortStatuses: [
        {
          id: '0',
          physicalLink: 'Down  '
        },
        {
          id: '1',
          physicalLink: 'Up 1000Mbps full'
        }
      ],
      radioStatuses: [
        {
          id: 0,
          band: '2.4G',
          transmitterPower: 'max',
          channel: 8,
          channelBandwidth: '20',
          rssi: 39
        },
        {
          id: 1,
          band: '5G',
          transmitterPower: 'max',
          channel: 64,
          channelBandwidth: '40',
          rssi: 52
        }
      ],
      cellularStatus: {
        activeSim: 'SIM 0',
        imei: '861107037457984',
        lteFirmware: 'EC25AU_FAR02A04M4G - SubEdition: V01',
        connectionStatus: '2G',
        connectionChannel: 10762,
        rfBand: 'WCDMA 2100',
        wanInterface: 'wwan0',
        roamingStatus: 'not registered, searching',
        radioUptime: 0,
        signalStrength: '-113 dBm (bad)',
        ecio: -7,
        rscp: -81,
        rsrp: 0,
        rsrq: 0,
        sinr: 0,
        primarySimStatus: {
          txBytes: 12,
          rxBytes: 12,
          cardRemovalCount: 0,
          dhcpTimeoutCount: 0,
          networkLostCount: 0,
          switchCount: 0,
          imsi: '',
          iccid: ''
        }
      }
    },
    {
      serialNumber: '922102004888',
      name: 'mock-ap-2',
      apGroupId: '58195e050b8a4770acc320f6233ad8d9',
      venueId: '991eb992ece042a183b6945a2398ddb9',
      tags: [
        ''
      ],
      model: 'T750SE',
      macAddress: '58:FB:96:1A:18:40',
      firmwareVersion: '7.0.0.103.390',
      uptime: 2669683,
      status: '1_01_NeverContactedCloud',
      meshRole: 'DISABLED',
      networkStatus: {
        ipAddress: '192.168.5.103',
        externalIpAddress: '210.58.90.254',
        ipAddressType: 'dynamic',
        netmask: '255.255.255.0',
        gateway: '192.168.5.1',
        primaryDnsServer: '10.10.10.10',
        managementTrafficVlan: 1
      },
      lanPortStatuses: [
        {
          id: '0',
          physicalLink: 'Down  '
        },
        {
          id: '1',
          physicalLink: 'Down  '
        },
        {
          id: '2',
          physicalLink: 'Up 100Mbps full'
        }
      ],
      radioStatuses: [
        {
          id: 0,
          band: '2.4G',
          transmitterPower: 'max',
          channel: 3,
          channelBandwidth: '20',
          rssi: 62
        },
        {
          id: 1,
          band: '5G',
          transmitterPower: 'max',
          channel: 128,
          channelBandwidth: '80',
          rssi: 36
        }
      ],
      cellularStatus: {
        activeSim: 'SIM 0',
        imei: '861107037457984',
        lteFirmware: 'EC25AU_FAR02A04M4G - SubEdition: V01',
        connectionStatus: '2G',
        connectionChannel: 10762,
        rfBand: 'WCDMA 2100',
        wanInterface: 'wwan0',
        roamingStatus: 'not registered, searching',
        radioUptime: 0,
        signalStrength: '-113 dBm (bad)',
        ecio: -7,
        rscp: -81,
        rsrp: 0,
        rsrq: 0,
        sinr: 0
      }
    }
  ]
}
export const mockedMeshAps = {
  ...mockAPList,
  totalCount: 1,
  data: [{
    ...mockAPList.data[0],
    downlink: [],
    uplink: [],
    meshRole: 'RAP',
    hops: 0,
    floorplanId: '94bed28abef24175ab58a3800d01e24a',
    downlinkCount: 2,
    healthStatus: 'Unknown'
  }]
}

export const mockedApPosition = {
  xPercent: 79.716515,
  yPercent: 31.556149
}

export const mockAPModels = {
  apModels: [
    {
      model: 'R550',
      version: '7.0.0.104.1432',
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
        'GB'
      ],
      lldpEnable: true,
      lldpAdInterval: 30,
      lldpHoldTime: 120,
      lldpMgmtEnable: true,
      ledOn: true,
      isOutdoor: false,
      has160MHzChannelBandwidth: false,
      canSupportPoeOut: false,
      canSupportPoeMode: true,
      canSupportLacp: true,
      requireOneEnabledTrunkPort: true,
      poeModeCapabilities: [
        'Auto',
        '802.3af',
        '802.3at'
      ],
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/7.0.0.104.1432/r550.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1748574836&Signature=lJa22svKlZ7IW%2FodkUQJoqfAepSa0Sprg4kl4BjXzuHBOXCYVamUTZDOA6ZzBhBGijDJKRPXR3pavLr6Y5DRjTVU%2B3DSUKV6i0%2B%2FlcJBrPAzEFBRipV%2FYNkwf7CnEaYSyiJk%2B1tdcLP3rhE%2F1BAiSPgFZrgxjgRIHTjZj0L0pAESFGpOctm8HBUCma7hb3O%2BFr2hGTvX%2FjYQGpVoBpJYI2KJkpoh6eG%2Buixg3Nubozsed6ADHEcbMXL77%2FLx7FF72LvJwPJXJgyI9Z%2BWgncB4xE%2BtUlDCW8eub8twt0k2KgeGsPFGugo%2FqwW%2BrEiBmUXBEEmzkrehZbQ9Q86soyb5w%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/7.0.0.104.1432/appearance-r550.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1748574836&Signature=e%2BznHbfd%2BE61f1N6k1w%2FVHhTwkY%2BroShIZR1GU%2BwQjf1Cj6CuG5pF0ev1r1Bqo%2BS9XiDywoRgA6A5I3AXs3eEvyrlZhy%2BDQqI5u93Z%2FrlB%2B%2FQChfhzeta2LI2d9dMEV%2BFzWTONOQRNb0vty46B0XOMDpr8yzdMC79wNmApHEjYzHrjF4q1WLmlSMjZ%2F%2BosDDvpCVovQaMmQBHamfathKm1e5umCKxU2rq0fBQE3q3%2FPH8Alg8vGLTKG2Wzooze2K2INyzp9afIvfBmi1h7YF4PVyhoh9PAEAJVXZhS%2FBPBfIesXGh00BNwJhH7t9NL6Z%2Fa74sJVmmJyIPktmyN%2BwJQ%3D%3D',
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
      support11BE: false,
      maxChannelization24G: 40,
      maxChannelization5G: 80,
      supportMesh: true,
      supportBandCombination: false,
      supportAntennaType: false
    },
    {
      externalAntenna: {
        enable24G: false,
        enable50G: false,
        gain24G: 8,
        gain50G: 8,
        supportDisable: true,
        coupled: true
      },
      model: 'T750SE',
      version: '7.0.0.104.1432',
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
      allowDfsCountry: [
        'US',
        'SG'
      ],
      allowCbandCountry: [
        'GB'
      ],
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
        '802.3bt-Class_7'
      ],
      lanPortPictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/7.0.0.104.1432/t750se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1748574837&Signature=oVIUJkbOBC8A0TnJO1nEhzu1wslrP8TKFU8MV4FSV0oWYbpmF%2Fd%2BdCCeJSZdERO9Zk6x7jhp%2FxZr1QYmiqF%2B0FPKFwhHUA%2FZsRbZc8nzDh2HFgW%2B6eCNJE%2BwqHqY5TJHQkNxrzmvkmubb3lE28WMR9pF9MATVKTHtl3DObYpCBRpZ8AKNfGtb2zuZBNRsHJzaa7kySlMxbPfvdvcQjKd41EvIOiQ%2FRGN3GwRJi5QzNhqUmtiPX1RD0ObUt9vfrYI8vlIK6OsAq8Dvq%2FcUJneSMEP8EAAuV2Po3cgAiqL59r5%2BK2qmrgZ8e6%2BRS%2FdMm4Whok4X4nZQvDgTFkXs9cq8w%3D%3D',
      pictureDownloadUrl: 'https://storage.googleapis.com/dev-alto-file-storage-0/wifi/firmware/7.0.0.104.1432/appearance-t750se.jpg?GoogleAccessId=dev-alto-file-storage@alto-dev-200221.iam.gserviceaccount.com&Expires=1748574837&Signature=q8RFZG1TNWggNTbWDpm34DZacOzW%2FdQCKwYMJl3ThHhAucCzlb17l8vw4Gj4AmP8ImTcjkmmZkFcQ%2FKeR4lG1ptMPwfrHLWWun2xUvRgMjJrvD08ZgwVM8%2Ftp2q37lST5wohnQW8EFtpc3ZZRH5wTSvsWo8G%2FpBsyAdpg3siH2OxjVf8w99Mki3kAhsJeNapPg7MAFUKSE7vfyGPDVbDRuyF2efFsCQOVxGNv%2FeGmSfErtPk77NwuB%2FUHgpC1oX70%2F9p3Eecy55pj0OCg8JSCqbR5GeVhLGcX0j8yWuO838pMjMeKwIadgwTCSIjEoJTGm%2Fb81BRpWhB%2B49MEB2K5g%3D%3D',
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
      supportMesh: true,
      supportBandCombination: false,
      supportAntennaType: false
    }
  ]
}

export const mockVenueList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '2c16284692364ab6a01f4c60f5941836',
      latitude: '40.769141',
      longitude: '-73.9429713',
      name: 'My-Venue',
      status: '1_InSetupPhase',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 }
    },
    {
      city: 'Sunnyvale, California',
      country: 'United States',
      description: '',
      id: 'a919812d11124e6c91b56b9d71eacc31',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'test',
      status: '1_InSetupPhase',
      switchClients: 2,
      switches: 1,
      edges: 3,
      clients: 1
    }
  ]
}

export const mockGroupedApList = {
  fields: [
    'serialNumber',
    'name',
    'model',
    'apGroupId'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      groupedField: 'apGroupId',
      aps: []
    },
    {
      groupedField: 'apGroupId',
      groupedValue: 'f2863482681e489ab8566e2f229572aa',
      aps: [
        {
          serialNumber: 'mock_ap_1',
          name: 'mock-ap-1',
          apGroupId: 'f2863482681e489ab8566e2f229572aa',
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          clientCount: 1
        }
      ]
    },
    {
      groupedField: 'apGroupId',
      groupedValue: '58195e050b8a4770acc320f6233ad8d9',
      aps: [
        {
          serialNumber: 'mock_ap_2',
          name: 'mock-ap-2',
          apGroupId: '58195e050b8a4770acc320f6233ad8d9',
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          clientCount: 1,
          model: 'R550'
        },
        {
          serialNumber: 'mock_ap_3',
          name: 'mock-ap-3',
          apGroupId: '58195e050b8a4770acc320f6233ad8d9',
          venueId: '0e2f68ab79154ffea64aa52c5cc48826',
          clientCount: 1,
          model: 'T750SE'
        }
      ]
    }
  ]
}

export const mockedApLanPortSettings_T750SE = {
  poeMode: 'Auto',
  poeOut: false,
  lanPorts: [
    {
      type: 'TRUNK' as 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '1',
      enabled: true,
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      vni: 1
    },
    {
      type: 'TRUNK' as 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094',
      portId: '2',
      enabled: true,
      defaultType: 'TRUNK',
      id: '2',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      vni: 1
    },
    {
      type: 'ACCESS' as 'ACCESS',
      untagId: 1,
      vlanMembers: '1',
      portId: '3',
      enabled: true,
      defaultType: 'ACCESS',
      id: '3',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      vni: 1
    }
  ],
  useVenueSettings: true
}