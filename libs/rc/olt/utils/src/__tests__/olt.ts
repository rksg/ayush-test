import { OltStatusEnum, OltCageStateEnum } from '../'

export const mockOlt = {
  name: 'TestOlt',
  serialNumber: 'testSerialNumber',
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
}, {
  cage: 'S1/5',
  state: OltCageStateEnum.DOWN
}, {
  cage: 'S1/6',
  state: OltCageStateEnum.DOWN
}, {
  cage: 'S1/7',
  state: OltCageStateEnum.DOWN
}]

export const mockOnuList = [
  {
    name: 'ont_9',
    ports: 3,
    usedPorts: 2,
    poeClass: '2',
    portDetails: [
      {
        portIdx: '1',
        status: 'up',
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
        status: 'up',
        vlan: ['66'],
        poePower: 3
      }
    ]
  }, {
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
  }
]