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

export const mockApListByApGroup = [{
  aps: [{
    serialNumber: '302002030366',
    name: 'R550_0601',
    model: 'R550',
    apMac: '34:20:E3:1D:0C:50'
  },
  {
    serialNumber: '922102004888',
    name: 'T750SE',
    model: 'T750SE',
    apMac: 'E0:10:7F:23:DA:B0'
  }],
  apGroupId: 'f2863482681e489ab8566e2f229572aa',
  apGroupName: '',
  venueId: '0e2f68ab79154ffea64aa52c5cc48826',
  members: 2
}, {
  apGroupId: 'f2863482681e489ab8566e2f229572bb',
  apGroupName: 'test-apGroup',
  venueId: '0e2f68ab79154ffea64aa52c5cc48826',
  aps: [{
    serialNumber: '302002030377',
    name: 'R550_tttt',
    model: 'R550',
    apMac: '34:20:E3:1D:0C:77'
  }],
  members: 1
}]

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