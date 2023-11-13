import { EdgeAlarmSummary, EdgeSdLanViewData, EdgeIpModeEnum, EdgePortTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

export const mockedVenueList = {
  fields: ['name', 'id'],
  totalCount: 5,
  page: 1,
  data: [
    {
      id: 'venue_00001',
      name: 'My-Venue',
      edges: 0
    },
    {
      id: 'venue_00002',
      name: 'airport',
      edges: 1
    },
    {
      id: 'venue_00003',
      name: 'MockedVenue 1',
      edges: 0
    },
    {
      id: 'venue_00004',
      name: 'MockedVenue 2',
      edges: 1
    },
    {
      id: 'venue_00005',
      name: 'SG office',
      edges: 1
    }
  ]
}


export const mockEdgeList = {
  fields: [
    'name','serialNumber','venueId','venueName'
  ],
  totalCount: 5,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      serialNumber: '0000000001',
      venueId: 'venue_00001',
      venueName: 'Venue01'
    },
    {
      name: 'Smart Edge 2',
      serialNumber: '0000000002',
      venueId: 'venue_00002',
      venueName: 'Venue02'
    },
    {
      name: 'Smart Edge 3',
      serialNumber: '0000000003',
      venueId: 'venue_00003',
      venueName: 'Venue03'
    },
    {
      name: 'Smart Edge 4',
      serialNumber: '0000000004',
      venueId: 'venue_00004',
      venueName: 'Venue04'
    },
    {
      name: 'Smart Edge 5',
      serialNumber: '0000000005',
      venueId: 'venue_00005',
      venueName: 'Venue05'
    }
  ]
}

export const mockedTunnelProfileViewData = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'tunnelProfileId1',
      name: 'tunnelProfile1'
    },
    {
      id: 'tunnelProfileId2',
      name: 'tunnelProfile2'
    },
    {
      id: 'tunnelProfileId3',
      name: 'Default'
    }
  ]
}

export const mockEdgePortConfig = {
  ports: [
    {
      id: '6ab895d4-cb8a-4664-b3f9-c4d6e0c8b8c1',
      name: 'port0',
      mac: '00:0c:29:b6:ad:04',
      enabled: true,
      portType: EdgePortTypeEnum.WAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '1.1.1.1',
      subnet: '255.255.255.0',
      gateway: '1.1.1.1',
      corePortEnabled: true
    },
    {
      id: '20b445af-7270-438d-88a3-a5a2219c377b',
      name: 'local0',
      mac: '00:00:00:00:00:00',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '2.2.2.2',
      subnet: '255.255.255.0',
      gateway: '2.2.2.2',
      corePortEnabled: false
    },
    {
      id: 'cdecd42e-81e3-4d60-921c-6b05181a53ae',
      name: 'port1',
      mac: '00:0c:29:b6:ad:0e',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '3.3.3.3',
      subnet: '255.255.255.0',
      gateway: '3.3.3.3',
      corePortEnabled: false
    },
    {
      id: '6fcbcfc2-c207-4e45-b392-1f529cd1d6d4',
      name: 'tap0',
      mac: '02:fe:05:1f:95:85',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: false,
      ipMode: EdgeIpModeEnum.STATIC,
      ip: '4.4.4.4',
      subnet: '255.255.255.0',
      gateway: '4.4.4.4',
      corePortEnabled: false
    },
    {
      id: '081a71a7-aaad-4a13-967b-1c82166de11a',
      name: 'port2',
      mac: '00:0c:29:b6:ad:18',
      enabled: true,
      portType: EdgePortTypeEnum.LAN,
      natEnabled: true,
      ipMode: EdgeIpModeEnum.DHCP,
      ip: '5.5.5.5',
      subnet: '255.255.255.0',
      gateway: '5.5.5.5',
      corePortEnabled: false
    }
  ]
}

export const mockEdgePortStatus = [
  {
    portId: mockEdgePortConfig.ports[0].id,
    ip: '10.206.78.152'
  },
  {
    portId: mockEdgePortConfig.ports[1].id,
    ip: ''
  }
]

export const mockNetworkSaveData = {
  fields: ['venueId', 'networkId'],
  totalCount: 3,
  page: 1,
  data: [
    { networkId: 'network_1', venueId: 'venue_00002' },
    { networkId: 'network_2', venueId: 'venue_00002' },
    { networkId: 'network_3', venueId: 'venue_00005' }
  ]
}

export const mockDeepNetworkList = {
  requestId: '639283c7-7a5e-4ab3-8fdb-6289fe0ed255',
  response: [
    { name: 'MockedNetwork 1', id: 'network_1', type: NetworkTypeEnum.DPSK },
    { name: 'MockedNetwork 2', id: 'network_2', type: NetworkTypeEnum.PSK },
    { name: 'MockedNetwork 3', id: 'network_3', type: NetworkTypeEnum.OPEN }
  ]
}

export const mockedSdLanService = {
  id: 'mocked_sdLan_id',
  name: 'mockedSdLanData',
  venueId: 'f28540166b95406cae64b46bd12b742f',
  venueName: 'airport',
  edgeId: '9618C4AC2B1FC511EE8B2B000C2943FE7F',
  corePortMac: 'p2',
  networkIds: ['32e06116667b4749855ffbb991d8ac4b'],
  tunnelProfileId: 'f93802759efc49628c572df8af0718b8'
}

export const mockedSdLanDataList = [{
  id: 'mocked-sd-lan-1',
  name: 'Amy_sdLan_1',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a307d7077410456f8f1a4fc41d861567',
  venueName: 'Sting-Venue-1',
  edgeId: '96B968BD2C76ED11EEA8E4B2E81F537A94',
  edgeName: 'sting-vSE-b490',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'amyTunnel',
  networkIds: ['8e22159cfe264ac18d591ea492fbc05a'],
  networkInfos: [{
    networkId: '8e22159cfe264ac18d591ea492fbc05a',
    networkName: 'amyNetwork'
  }],
  corePortMac: 'c2:58:00:ae:63:f2',
  edgeAlarmSummary: {
    edgeId: 'mocked-edge-1',
    severitySummary: {
      critical: 1
    },
    totalCount: 1
  },
  serviceVersion: '1.0.0.100'
}, {
  id: 'mocked-sd-lan-2',
  name: 'Amy_sdLan_2',
  tenantId: '0f18d1cf714b4bcf94bef4654f1ab29c',
  venueId: 'a8def420bd6c4f3e8b28114d6c78f237',
  venueName: 'Sting-Venue-3',
  edgeId: '96BD19BB3B5CE111EE80500E35957BEDC3',
  edgeName: 'sting-vSE-b466',
  tunnelProfileId: 'aa3ecf6f283448d5bb8c0ce86790b843',
  tunnelProfileName: 'amyTunnel',
  networkIds: [],
  networkInfos: [],
  corePortMac: 'a2:51:0f:bc:89:c5',
  edgeAlarmSummary: {} as EdgeAlarmSummary,
  serviceVersion: '1.0.0.100'
}] as EdgeSdLanViewData[]

export const mockedNetworkViewData = {
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '8e22159cfe264ac18d591ea492fbc05a',
      name: 'amyNetwork',
      nwSubType: 'dpsk'
    }
  ]
}