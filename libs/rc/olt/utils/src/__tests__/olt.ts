import { OltStatusEnum, OltCageStateEnum, OltPortStatusEnum } from '../types'

export const mockOlt = {
  name: 'TestOlt',
  serialNumber: 'olt-id',
  status: OltStatusEnum.ONLINE,
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '22.649',
  ip: '134.242.136.112',
  venueId: 'mock_venue_1',
  venueName: 'Mock Venue 1'
}

export const mockOfflineOlt = {
  ...mockOlt,
  name: 'TestOfflineOlt',
  serialNumber: 'offlineOltSerialNumber',
  status: OltStatusEnum.OFFLINE
}

export const mockEmptySnOlt = {
  ...mockOlt,
  name: '',
  serialNumber: '',
  status: OltStatusEnum.OFFLINE,
  ip: '1.1.1.1'
}

export const mockOltList = [
  mockOlt
]

export const mockOltCageList = [{
  cage: 'S1/1',
  state: OltCageStateEnum.DOWN
}, {
  cage: 'S1/2',
  state: OltCageStateEnum.UP
}, {
  cage: 'S1/3',
  state: OltCageStateEnum.DOWN
}, {
  cage: 'S1/4',
  state: OltCageStateEnum.DOWN
}]

export const mockOltPortList = [{
  port: 'S1/1',
  status: OltPortStatusEnum.DOWN,
  speed: '1',
  vlanId: '200'
}, {
  port: 'S1/2',
  status: OltPortStatusEnum.UP,
  speed: '1',
  vlanId: '200'
}, {
  port: 'S1/3',
  status: OltPortStatusEnum.DOWN,
  speed: '1',
  vlanId: '200'
}]

export const mockOntList = [{
  id: 'ont-id-1',
  name: 'ont_1',
  ports: 3,
  usedPorts: 2,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.UP,
      vlan: ['30'],
      poePower: 2.5
    },
    {
      portIdx: '2',
      status: OltCageStateEnum.DOWN,
      vlan: ['11'],
      poePower: 10
    },
    {
      portIdx: '3',
      status: OltCageStateEnum.UP,
      vlan: ['66'],
      poePower: 3
    }
  ]
}, {
  id: 'ont-id-2',
  name: 'ont_2',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-3',
  name: 'ont_3',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-4',
  name: 'ont_4',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-5',
  name: 'ont_5',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-6',
  name: 'ont_6',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-7',
  name: 'ont_7',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-8',
  name: 'ont_8',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-9',
  name: 'ont_9',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-10',
  name: 'ont_10',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-11',
  name: 'ont_11',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}, {
  id: 'ont-id-12',
  name: 'ont_12',
  ports: 1,
  usedPorts: 0,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: OltCageStateEnum.DOWN,
      vlan: [],
      poePower: 0
    }
  ]
}]

export const mockVenuelist = {
  totalCount: 10,
  page: 1,
  data: [
    {
      city: 'New York',
      country: 'United States',
      description: 'My-Venue',
      id: '3f10af1401b44902a88723cb68c4bc77',
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