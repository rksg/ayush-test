export const GuestClient = {
  totalCount: 34,
  page: 1,
  data: [
    {
      name: 'test1',
      id: '865c88e0-7bae-47a1-9247-508a027a9500',
      creationDate: '2022-11-14T08:51:36.499Z',
      expiryDate: '0',
      emailAddress: '',
      guestType: 'type',
      ssid: 'guest pass wlan',
      networkId: '',
      passDurationHours: 1,
      guestStatus: 'Expired',
      notes: '',
      maxNumberOfClients: -1
    }, {
      name: 'test2',
      id: '16bcc049-6f38-47b9-8ad1-daf803c4e8b9',
      creationDate: '2022-11-15T08:57:50.392Z',
      expiryDate: '',
      mobilePhoneNumber: '+12015550123',
      emailAddress: '',
      guestType: 'SelfSign',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: '',
      guestStatus: 'Not Applicable',
      notes: '',
      maxNumberOfClients: ''
    }, {
      name: 'test3',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3bf3',
      creationDate: '2022-11-28T08:15:14.690Z',
      expiryDate: '2022-12-28T08:15:14.695Z',
      emailAddress: '',
      guestType: 'HostGuest',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: 720,
      guestStatus: 'Offline',
      notes: '',
      maxNumberOfClients: 3
    }, {
      name: 'test4',
      id: '99fbe8f0-bc9c-4f95-ac07-54146cf5c117',
      creationDate: '2022-11-20T08:57:12.338Z',
      mobilePhoneNumber: '+886933222333',
      emailAddress: 'a@email.com',
      guestType: 'GuestPass',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007aca',
      passDurationHours: 168,
      guestStatus: 'Online (1)',
      notes: '',
      maxNumberOfClients: 2,
      clients: [{
        osType: 'ios',
        healthCheckStatus: 'good',
        clientMac: 'AA:AA:AA:AA:AA:AA',
        ipAddress: '1.1.1.1',
        username: 'user',
        hostname: 'host',
        venueId: '0004e252a9d04180855813131d007aca',
        venueName: 'testVenue',
        apMac: 'BB:BB:BB:BB:BB:BB',
        apSerialNumber: '422039000038',
        apName: 'testAp',
        switchSerialNumber: '',
        switchName: '',
        networkId: '3f04e252a9d04180855813131d007aca',
        networkName: 'guest pass wlan',
        networkSsid: 'guest pass wlan',
        connectSince: '2022-11-28T14:55:15.924Z'
      }]
    }, {
      name: 'disable_client',
      id: '37a626e9-5d97-4349-b7a5-8822c62d3000',
      creationDate: '2022-11-27T08:15:14.690Z',
      expiryDate: '2022-12-28T08:15:14.695Z',
      emailAddress: '',
      guestType: 'GuestPass',
      ssid: 'guest pass wlan',
      networkId: '3f04e252a9d04180855813131d007000',
      passDurationHours: 168,
      guestStatus: 'Disabled',
      notes: '',
      maxNumberOfClients: 3
    },
  ]
}

export const GuestNetworkList = {
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'NMS-app6-GUEST',
      id: '0189575828434f94a7c0b0e611379d26',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      ssid: 'NMS-app6-GUEST',
      venues: {
        count: 1,
        names: ['UI-TEST-VENUE']
      },
      aps: 3,
      clients: 0
    }
  ]
}

export const clientList = [{
  apMac: '28:B3:71:28:78:50',
  apName: 'UI team ONLY',
  apSerialNumber: '422039000230',
  bssid: '28:b3:71:a8:78:51',
  clientMac: '24:41:8c:c3:16:df',
  framesDropped: 0,
  healthCheckStatus: 'Good',
  hostname: 'LP-XXXXX',
  ipAddress: '10.206.1.93',
  networkId: '423c3673e74f44e69c0f3b35cd579ecc',
  networkName: 'NMS-app6-WLAN-QA',
  networkSsid: 'NMS-app6-WLAN-QA',
  noiseFloor_dBm: -96,
  osType: 'Windows',
  receiveSignalStrength_dBm: -32,
  receivedBytes: 104098725,
  receivedPackets: 344641,
  rfChannel: 140,
  snr_dB: 64,
  timeConnectedMs: 1669263032,
  transmittedBytes: 22551474,
  transmittedPackets: 87872,
  username: '24418cc316df',
  venueId: '87c982325ef148a2b7cefe652384d3ca',
  venueName: 'UI-TEST-VENUE',
  vlan: 1,
  wifiCallingClient: false
}]

export const clientMeta = {
  data: [
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:97:c7:ef',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:c9:ab:2d',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: 'aa:5c:7a:99:38:a2',
      apName: 'UI team AP'
    }
  ]
}

export const histClientList = {
  totalCount: 2,
  page: 1,
  data: [{
    bssid: '28:b3:71:a8:78:51',
    clientIP: '10.206.1.137',
    clientMac: '92:37:9d:40:3d:bd',
    disconnectTime: '1669277258',
    hostname: '92:37:9d:40:3d:bd',
    id: 'd47626f6206040c8925822acf4253bc9',
    osType: 'iOS Phone',
    serialNumber: '422039000230',
    sessionDuration: '1803',
    ssid: 'NMS-app6-WLAN-QA',
    userId: '',
    venueId: '87c982325ef148a2b7cefe652384d3ca'
  }]
}

export const clientApList = [{
  apGroupId: '48b4b5c90c98456097fb7cc3287ebbd1',
  clientCount: 2,
  externalIp: '210.58.90.254',
  firmware: '6.2.0.103.460',
  indoorModel: true,
  ip: '10.206.1.214',
  lastContacted: '2022-11-24T09:50:55.359Z',
  lastUpdated: '2022-11-08T14:34:18.835Z',
  mac: '28:B3:71:28:78:50',
  meshRole: 'DISABLED',
  model: 'H320',
  name: 'UI team ONLY',
  position: { xPercent: 0, yPercent: 0 },
  serialNumber: '422039000230',
  softDeleted: false,
  state: 'Operational',
  subState: 'Operational',
  tags: ['123', 'test-tag'],
  updatedDate: '2022-11-08T14:34:18.835+0000',
  uptime_seconds: 1380448,
  venueId: '87c982325ef148a2b7cefe652384d3ca'
}]

export const clientVenueList = [{
  address: {
    addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA',
    city: 'Sunnyvale, California',
    country: 'United States',
    latitude: 37.4112751,
    longitude: -122.0191908,
    timezone: 'America/Los_Angeles'
  },
  createdDate: '2022-11-08T10:14:10.039+00:00',
  id: '87c982325ef148a2b7cefe652384d3ca',
  name: 'UI-TEST-VENUE',
  updatedDate: '2022-11-08T10:14:10.039+00:00'
}]

export const clientNetworkList = [{
  id: '423c3673e74f44e69c0f3b35cd579ecc',
  name: 'NMS-app6-WLAN-QA',
  tenantId: '0e73cda119aa4f2983e1a761c359ca67',
  type: 'psk',
  venues: [{
    allApGroupsRadio: 'Both',
    allApGroupsRadioTypes: ['2.4-GHz', '5-GHz'],
    dual5gEnabled: true,
    id: '38488d03dfb849959e3f7d3dfc91cce7',
    isAllApGroups: true,
    networkId: '423c3673e74f44e69c0f3b35cd579ecc',
    tripleBandEnabled: false,
    venueId: '87c982325ef148a2b7cefe652384d3ca'
  }],
  wlan: {
    enabled: true,
    macAddressAuthentication: false,
    macAuthMacFormat: 'UpperDash',
    managementFrameProtection: 'Disabled',
    passphrase: 'ADMIN!234',
    ssid: 'NMS-app6-WLAN-QA',
    vlanId: 1,
    wlanSecurity: 'WPA2Personal'
  }
}]

export const eventMetaList = {
  data: [{
    apName: 'UI team ONLY',
    id: 'd47626f6206040c8925822acf4253bc9',
    isApExists: true,
    isClientExists: false,
    isVenueExists: true,
    networkId: '0189575828434f94a7c0b0e611379d26',
    venueName: 'UI-TEST-VENUE'
  }]
}

export const clientReportList = [{
  applications: 73.29609288004667,
  apsConnected: 1,
  avgRateBPS: 144042.1869025805,
  avgSessionLengthSeconds: null,
  sessions: 1.0002442201269182,
  userTraffic5GBytes: 1542709827,
  userTraffic6GBytes: 0,
  userTraffic24GBytes: 0,
  userTrafficBytes: 1542709827
}]

export const apCaps = {
  apModels: [{
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