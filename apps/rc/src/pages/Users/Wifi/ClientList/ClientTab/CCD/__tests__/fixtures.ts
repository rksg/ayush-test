export const mockedSocket = {
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  disconnected: false
}

export const mockVenueList = [
  {
    id: '7ce848890a38407a98ee7f2928646d5f',
    name: 'CCD'
  },
  {
    id: 'a3c431c65f644bda98402eb31934ec93',
    name: 'My-Venue'
  }
]

export const mockApListByApGroup = {
  data: [{
    aps: [{
      serialNumber: '302002030366',
      name: 'R550_0601',
      model: 'R550',
      fwVersion: '7.0.0.103.390',
      venueId: '0e2f68ab79154ffea64aa52c5cc48826',
      venueName: 'My-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.206.78.138',
      apMac: '34:20:E3:1D:0C:50',
      apStatusData: {
        APRadio: [{
          txPower: null,
          channel: 1,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        }, {
          txPower: null,
          channel: 64,
          band: '5G',
          Rssi: null,
          radioId: 1
        }]
      },
      meshRole: 'DISABLED',
      deviceGroupId: 'f2863482681e489ab8566e2f229572aa',
      deviceGroupName: ''
    },
    {
      serialNumber: '922102004888',
      name: 'T750SE',
      model: 'T750SE',
      fwVersion: '7.0.0.103.390',
      venueId: '991eb992ece042a183b6945a2398ddb9',
      venueName: 'joe-test',
      deviceStatus: '1_09_Offline',
      IP: '192.168.5.103',
      apMac: 'E0:10:7F:23:DA:B0',
      apStatusData: {
        APRadio: [{
          txPower: null,
          channel: 5,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        }, {
          txPower: null,
          channel: 104,
          band: '5G',
          Rssi: null,
          radioId: 1
        }]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '75f7751cd7d34bf19cc9446f92d82ee5',
      tags: '',
      deviceGroupName: ''
    }],
    deviceGroupId: 'f2863482681e489ab8566e2f229572aa',
    deviceGroupName: '',
    venueId: '0e2f68ab79154ffea64aa52c5cc48826',
    networks: {
      count: 3,
      names: [
        'bess_google',
        'app5-gpass',
        'joe-psk'
      ]
    },
    members: 2,
    incidents: 0,
    clients: 0
  }, {
    deviceGroupId: 'f2863482681e489ab8566e2f229572bb',
    deviceGroupName: 'test-apGroup',
    venueId: '0e2f68ab79154ffea64aa52c5cc48826',
    aps: [{
      serialNumber: '302002030377',
      name: 'R550_tttt',
      model: 'R550',
      fwVersion: '7.0.0.103.390',
      venueId: '0e2f68ab79154ffea64aa52c5cc48826',
      venueName: 'My-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.206.78.138',
      apMac: '34:20:E3:1D:0C:77',
      apStatusData: {
        APRadio: [{
          txPower: null,
          channel: 1,
          band: '2.4G',
          Rssi: null,
          radioId: 0
        }, {
          txPower: null,
          channel: 64,
          band: '5G',
          Rssi: null,
          radioId: 1
        }]
      },
      meshRole: 'DISABLED',
      deviceGroupId: 'f2863482681e489ab8566e2f229572bb',
      deviceGroupName: ''
    }],
    members: 1,
    incidents: 0,
    clients: 0
  }]
}

export const mockApInfoList = [{
  serialNumber: '302002030366',
  name: 'R550_0601',
  model: 'R550',
  apMac: '34:20:E3:1D:0C:50',
  ssid: 'joe-test',
  radio: 'Radio 5G'
}, {
  serialNumber: '922102004888',
  name: 'T750SE',
  model: 'T750SE',
  apMac: 'E0:10:7F:23:DA:B0'
}, {
  serialNumber: '302002030377',
  name: 'R550_tttt',
  model: 'R550',
  apMac: '34:20:E3:1D:0C:77'
}]

export const mockCcdDataSuccess = {
  dataMessage: {
    apMac: '22:22:22:22:22:22',
    clientMac: '11:11:11:11:11:11',
    destinationModule: 1,
    destinationServerId: 'e0:10:7f:23:da:b8',
    destinationServerName: 'RuckusAP',
    destinationServerType: 2,
    messageId: 2,
    reportingModule: 1,
    sourceModule: 0,
    sourceServerId: '18:af:61:60:49:0f',
    sourceServerType: 1,
    statusCode: 0,
    protocol: 'TCP'
  }
}

export const mockCcdDataFail = {
  dataMessage: {
    apMac: '22:22:22:22:22:22',
    clientMac: '11:11:11:11:11:11',
    destinationModule: 1,
    destinationServerId: 'e0:10:7f:23:da:b8',
    destinationServerType: 1,
    messageId: 3,
    reportingModule: 1,
    sourceModule: 0,
    sourceServerId: '18:af:61:60:49:0f',
    sourceServerType: 2,
    statusCode: 1,
    info: 'Fail'
  }
}

export const mockCcdDataAnotherAp = {
  dataMessage: {
    apMac: '33:33:33:33:33:33',
    clientMac: '11:11:11:11:11:11',
    destinationModule: 1,
    destinationServerId: 'e0:10:7f:23:da:b8',
    destinationServerName: 'RuckusAP',
    destinationServerType: 2,
    messageId: 2,
    reportingModule: 1,
    sourceModule: 0,
    sourceServerId: '18:af:61:60:49:0f',
    sourceServerType: 1,
    statusCode: 0,
    protocol: 'TCP'
  }
}

export const mockCcdDataNoAp = {
  dataMessage: {
    clientMac: '11:11:11:11:11:11',
    destinationModule: 1,
    destinationServerId: 'e0:10:7f:23:da:b8',
    destinationServerName: 'RuckusAP',
    destinationServerType: 2,
    messageId: 2,
    reportingModule: 1,
    sourceModule: 0,
    sourceServerId: '18:af:61:60:49:0f',
    sourceServerType: 1,
    statusCode: 0
  }
}