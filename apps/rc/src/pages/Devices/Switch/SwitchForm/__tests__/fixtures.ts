export const venueListResponse = {
  fields: ['name', 'id'],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: '4c778ed630394b76b17bce7fe230cf9f',
      name: 'My-Venue'
    },
    {
      id: '01b1fe5d153d4a2a90455795af6ad877',
      name: 'airport'
    },
    {
      id: 'b2efc20b6d2b426c836d76110f88941b',
      name: 'dsfds'
    },
    {
      id: 'f27f33e0475d4f49af57350fed788c7b',
      name: 'SG office'
    },
    {
      id: 'a678f2e5767746a394a7b10c45235119',
      name: 'sadas'
    }
  ]
}

export const swtichListResponse = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'FEK0000S0A0',
      serialNumber: 'FEK0000S0A0',
      name: '7150stack',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      serialNumber: 'FEK0010S0A0',
      name: '7150stack',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      serialNumber: 'FEK0040S0A0',
      configReady: true,
      syncDataEndTime: ''
    },
    {
      id: 'FEK0030S0A0',
      configReady: true,
      syncDataEndTime: ''
    }
  ]
}

export const switchListEmptyResponse = {
  data: [],
  fields: ['serialNumber', 'name', 'syncDataStartTime'],
  page: 1,
  totalCount: 0
}

export const vlansByVenueListResponse = [
  {
    id: 'd445b8332be940a6881886a8d9a91306',
    vlanId: 2,
    vlanName: 'vvv',
    ipv4DhcpSnooping: true,
    arpInspection: false,
    igmpSnooping: 'passive',
    multicastVersion: 2,
    spanningTreeProtocol: 'rstp',
    spanningTreePriority: 32768,
    switchFamilyModels: [
      {
        id: 'b6e7fbdfaaa04194b335e95de74d2398',
        model: 'ICX7550-48',
        taggedPorts: '1/1/39,1/3/1',
        slots: [
          {
            slotNumber: 2,
            enable: true,
            option: '2X40G'
          },
          {
            slotNumber: 3,
            enable: true,
            option: '2X40G'
          },
          {
            slotNumber: 1,
            enable: true
          }
        ]
      }
    ]
  }
]

export const vlansByVenueListEmptyResponse = []

export const switchResponse = {
  id: 'dc:ae:eb:2d:ff:8a',
  venueId: '561c8f43714647e2a4aecaba4c4b658b',
  name: 'ICX7150-C12 Router',
  enableStack: false,
  igmpSnooping: 'active',
  jumboMode: false,
  softDeleted: false,
  ipAddressInterfaceType: 'VE',
  ipAddressInterface: '1',
  ipAddressType: 'static',
  ipAddress: '192.168.1.73',
  subnetMask: '255.255.255.0',
  isPrimaryDeleted: false,
  sendedHostname: true,
  firmwareVersion: 'SPR09010e.bin',
  dhcpClientEnabled: false,
  dhcpServerEnabled: false,
  specifiedType: 'AUTO',
  rearModule: 'none'
}

export const switchDetailHeader = {
  type: 'device',
  isStack: false,
  rearModule: 'none',
  switchMac: 'dc:ae:eb:2d:ff:8a',
  switchName: 'ICX7150-C12 Router',
  model: 'ICX7150-C12P',
  id: 'dc:ae:eb:2d:ff:8a',
  syncDataEndTime: 1675058400741,
  firmwareVersion: 'SPR09010e',
  freeMemory: 310996992,
  clientCount: 0,
  floorplanId: '',
  deviceType: 'DVCNWTYPE_SWITCH',
  serialNumber: 'FEK3233R18P',
  yPercent: 0,
  portsStatus: { Down: 15, Up: 1 },
  staticOrDynamic: 'static',
  ipAddress: '192.168.1.73',
  dns: '8.8.8.8',
  cpu: 20,
  stackMember: false,
  cliApplied: false,
  subnetMask: '255.255.255.0',
  unitSerialNumbers: 'FEK3233R18P',
  modules: 'switch',
  venueName: 'My-Venue',
  isIpFullContentParsed: true,
  ipFullContentParsed: true,
  name: 'ICX7150-C12 Router',
  activeSerial: 'FEK3233R18P',
  suspendingDeployTime: '',
  cloudPort: '1/1/1',
  stackMemberOrder: '',
  numOfUnits: 1,
  memory: 69,
  switchType: 'router',
  portModuleIds: 'FEK3233R18P',
  configReady: true,
  deviceStatus: 'ONLINE',
  temperatureGroups:
    // eslint-disable-next-line max-len
    '[{"serialNumber":"FEK3233R18P","stackId":"DC AE EB 2D FF 8A","temperatureSlotList":[{"slotNumber":3,"temperatureValue":54},{"slotNumber":4,"temperatureValue":54.5},{"slotNumber":1,"temperatureValue":71.5},{"slotNumber":2,"temperatureValue":10}]}]',
  sendedHostname: true,
  venueId: '561c8f43714647e2a4aecaba4c4b658b',
  firmware: '',
  timestamp: 1675058400729,
  xPercent: 0,
  syncedSwitchConfig: true,
  defaultGateway: '0.0.0.0',
  stackMembers: [],
  uptime: '20 days, 8:53:43.00',
  poeUsage: { poeFree: 124000, poeTotal: 124000, poeUtilization: 0 },
  totalMemory: 1019744256,
  formStacking: false,
  tenantId: '449455f8e6d749389bb328d2718c85d8',
  family: 'ICX7150-C12P',
  numOfPorts: 16
}
