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
  model: 'R650',
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
    id: '3c7542acb84449918c176ce15ffb4c52',
    isApExists: true,
    isClientExists: false,
    isVenueExists: true,
    networkId: '0189575828434f94a7c0b0e611379d26',
    venueName: 'UI-TEST-VENUE'
  }]
}