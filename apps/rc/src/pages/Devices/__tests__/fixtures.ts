export const successResponse = {
  requestId: 'request-id'
}

export const venuelist = {
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
      clients: 1
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
  id: 'b1db87447fb04e019af0d122e61d93f4',
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
  venueId: '45aa5ab71bd040be8c445be8523e0b6c'
}]

export const dhcpAp = {
}