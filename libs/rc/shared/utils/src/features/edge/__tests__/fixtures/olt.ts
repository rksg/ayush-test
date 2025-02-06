import { EdgeNokiaOltStatusEnum } from '../../../../models/EdgeNokiaOltEnum'

export const mockOlt = {
  name: 'TestOlt',
  serialNumber: 'testSerialNumber',
  status: 'online' as EdgeNokiaOltStatusEnum,
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '22.649',
  ip: '134.242.136.112',

  venueId: 'mock_venue_1',
  venueName: 'Mock Venue 1',
  edgeClusterId: 'clusterId_1',
  edgeClusterName: 'Edge Cluster 1'
}

export const mockOltList = [
  mockOlt
]

export const mockOltCageList = [
  {
    cage: 'S1/1',
    state: 'down'
  },
  {
    cage: 'S1/2',
    state: 'up'
  },
  {
    cage: 'S1/3',
    state: 'down'
  },
  {
    cage: 'S1/4',
    state: 'down'
  },
  {
    cage: 'S1/5',
    state: 'down'
  },
  {
    cage: 'S1/6',
    state: 'down'
  },
  {
    cage: 'S1/7',
    state: 'down'
  },
  {
    cage: 'S1/8',
    state: 'down'
  },
  {
    cage: 'S1/9',
    state: 'down'
  },
  {
    cage: 'S1/10',
    state: 'down'
  },
  {
    cage: 'S1/11',
    state: 'down'
  },
  {
    cage: 'S1/12',
    state: 'up'
  },
  {
    cage: 'S1/13',
    state: 'down'
  },
  {
    cage: 'S1/14',
    state: 'down'
  },
  {
    cage: 'S1/15',
    state: 'down'
  },
  {
    cage: 'S1/16',
    state: 'down'
  }
]

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
        status: 'down',
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
        status: 'down',
        vlan: [],
        poePower: 0
      }
    ]
  }
]