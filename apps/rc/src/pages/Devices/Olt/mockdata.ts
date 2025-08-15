import { OltStatusEnum } from '@acx-ui/olt/utils'

export const oltList = [{
  venueId: 'e407295d681b4016ae15d4422618b770',
  venueName: 'Raj-Venue-MWC-1',
  edgeClusterId: '1cfd6c88-97b7-4d94-8888-45bd72163eb8',
  edgeClusterName: 'MWC_Demo_OVA_72',
  tenantId: '1cdc11256f8144e6802b661de4e5c46e',
  name: 'mock_nokia_mf_2_1',
  status: 'online',
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '24.449',
  ip: '134.242.137.40',
  serialNumber: 'FH2302A073A'
}, {
  venueId: 'e407295d681b4016ae15d4422618b770',
  venueName: 'Raj-Venue-MWC-1',
  edgeClusterId: '1cfd6c88-97b7-4d94-8888-45bd72163eb8',
  edgeClusterName: 'MWC_Demo_OVA_72',
  tenantId: '1cdc11256f8144e6802b661de4e5c46e',
  name: 'mock_nokia_mf_2_2',
  status: 'online',
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '24.449',
  ip: '134.242.137.41',
  serialNumber: 'FH2302A073B'
}]

export const oltCageList = [
  {
    cage: 'S1/1',
    state: 'down'
  },
  {
    cage: 'S1/2',
    state: 'down'
  },
  {
    cage: 'S1/3',
    state: 'down'
  },
  {
    cage: 'S1/4',
    state: 'up',
    speed: '1'
  },
  {
    cage: 'S1/5',
    state: 'down'
  },
  {
    cage: 'S1/6',
    state: 'up',
    speed: '1'
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
    state: 'down'
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

export const oltData = {
  venueId: 'e407295d681b4016ae15d4422618b770',
  venueName: 'Raj-Venue-MWC-1',
  edgeClusterId: '1cfd6c88-97b7-4d94-8888-45bd72163eb8',
  edgeClusterName: 'MWC_Demo_OVA_72',
  tenantId: '1cdc11256f8144e6802b661de4e5c46e',
  name: 'mock_nokia_mf_2_1',
  status: OltStatusEnum.ONLINE,
  vendor: 'Nokia',
  model: 'MF-2',
  firmware: '24.449',
  ip: '134.242.137.40',
  serialNumber: 'FH2302A073A'
}

export const ontData = [{
  id: 'ont-id-1',
  name: 'ont_1',
  ports: 3,
  usedPorts: 2,
  poeClass: '2',
  portDetails: [
    {
      portIdx: '1',
      status: 'up',
      vlan: ['30'],
      poePower: 2.5,
      taggedVlan: ['30'],
      untaggedVlan: ['12']
    },
    {
      portIdx: '2',
      status: 'down',
      vlan: ['11'],
      poePower: 10,
      taggedVlan: ['11']
    },
    {
      portIdx: '3',
      status: 'up',
      vlan: ['66'],
      poePower: 3,
      taggedVlan: ['66']
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
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
      status: 'down',
      vlan: [],
      poePower: 0
    }
  ]
}]