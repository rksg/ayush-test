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
    }, {
      country: 'Malaysia',
      dhcp: { enabled: true, mode: 'DHCPMODE_EACH_AP' },
      id: 'a4f9622e9c7547ba934fbb5ee55646c2',
      latitude: '4.854995099999999',
      longitude: '100.751032',
      name: 'Venue-DHCP'
    }, {
      country: 'United States',
      dhcp: { enabled: true, mode: 'DHCPMODE_MULTIPLE_AP' },
      id: '16b11938ee934928a796534e2ee47661',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      name: 'Venue-DHCP 2'
    }, {
      country: 'Canada',
      id: 'b6cd663931b34a8b8fc97a81bfaa0929',
      latitude: '51.12090129999999',
      longitude: '-114.0044601',
      name: 'Venue-MESH'
    }
  ]
}

export const venueCaps = {
  apModels: [{
    ledOn: true,
    model: 'E510'
  }, {
    ledOn: true,
    model: 'H320',
    canSupportPoeMode: false,
    canSupportPoeOut: false,
    lanPortPictureDownloadUrl: 'xxxxxxx/h320.jpg',
    lanPorts: [{
      defaultType: 'ACCESS',
      id: '1',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1'
    }, {
      defaultType: 'ACCESS',
      id: '2',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1'
    }, {
      defaultType: 'TRUNK',
      id: '3',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: true,
      untagId: 1,
      vlanMembers: '1-4094'
    }]
  }, {
    ledOn: true,
    model: 'T750',
    canSupportPoeMode: true,
    canSupportPoeOut: true,
    lanPortPictureDownloadUrl: 'xxxxxxx/t750.jpg',
    lanPorts: [{
      defaultType: 'TRUNK',
      id: '1',
      isPoeOutPort: true,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }, {
      defaultType: 'TRUNK',
      id: '2',
      isPoeOutPort: false,
      isPoePort: false,
      supportDisable: true,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }, {
      defaultType: 'TRUNK',
      id: '3',
      isPoeOutPort: false,
      isPoePort: true,
      supportDisable: false,
      trunkPortOnly: false,
      untagId: 1,
      vlanMembers: '1-4094'
    }],
    poeModeCapabilities: [
      'Auto',
      '802.3at',
      '802.3bt-Class_5',
      '802.3bt-Class_6',
      '802.3bt-Class_7'
    ]
  }, {
    allowDfsCountry: ['US', 'SG'],
    canSupportCellular: true,
    canSupportLacp: false,
    canSupportPoeMode: true,
    canSupportPoeOut: false,
    capabilityScore: 79,
    has160MHzChannelBandwidth: false,
    isOutdoor: false,
    lanPortPictureDownloadUrl: 'xxxxxxx/m510.jpg',
    lanPorts: [{
      id: '1',
      displayLabel: 'WAN',
      defaultType: 'TRUNK',
      untagId: 1,
      vlanMembers: '1-4094'
    }],
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
  }],
  version: '6.0.0.x.xxx'
}

export const aplist = {
  totalCount: 2,
  page: 1,
  data: [{
    name: 'mock-ap',
    serialNumber: '125488555569',
    venueId: '52001e212a02484e815a8cadf0024f2b'
  }, {
    name: 'mock-ap2',
    serialNumber: '150000000761',
    venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b'
  }]
}

export const apGrouplist = [{
  id: 'f9903daeeadb4af88969b32d185cbf27',
  isDefault: true,
  venueId: '2c16284692364ab6a01f4c60f5941836'
}, {
  id: '9095a8cf11c845a9afe4d3643c46a44d',
  isDefault: false,
  name: 'testgroup',
  venueId: '7ae27179b7b84de89eb7e56d9b15943d'
}]

export const apDetailsList = [{
  apGroupId: 'f9903daeeadb4af88969b32d185cbf27',
  clientCount: 0,
  indoorModel: false,
  lastUpdated: '2022-07-05T08:29:15.484Z',
  mac: '456789876554',
  meshRole: 'DISABLED',
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
}, {
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
}]

export const dhcpAp = [{
  requestId: '3be06d50-5ae9-4d7f-92b6-146b5b7d77b4',
  response: [{
    dhcpApRole: 'PrimaryServer',
    serialNumber: '422039000034',
    venueDhcpEnabled: true,
    venueDhcpMode: 'EnableOnMultipleAPs',
    venueId: 'a4f9622e9c7547ba934fbb5ee55646c2'
  }]
}, {
  requestId: '3be06d50-5ae9-4d7f-92b6-146b5b7d77b4',
  response: [{
    dhcpApRole: 'BackupServer',
    serialNumber: '422039000034',
    venueDhcpEnabled: true,
    venueDhcpMode: 'EnableOnMultipleAPs',
    venueId: '16b11938ee934928a796534e2ee47661'
  }]
}]