import { OltStatusEnum, OltCageStateEnum, OltSlotType } from '../types'

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
  ],
  clientDetails: [
    {
      macAddress: '00:00:00:00:00:00',
      hostname: 'ont_1_client',
      port: '1'
    },
    {
      macAddress: '00:00:00:00:00:01',
      hostname: 'ont_1_client_2',
      port: '2'
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
  ],
  clientDetails: [
    {
      macAddress: '00:00:00:00:00:00',
      hostname: 'ont_1_client',
      port: '1'
    },
    {
      macAddress: '00:00:00:00:00:01',
      hostname: 'ont_1_client_2',
      port: '2'
    },
    {
      macAddress: '00:00:00:00:00:02',
      hostname: 'ont_1_client_3',
      port: '3'
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

export const networkCardSlots = [
  {
    type: OltSlotType.NT,
    slots: [{
      label: 'TOD',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'ALM',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'OOB',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'LEMI',
      status: OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }, {
      label: 'UPLINK',
      type: 'uplink',
      status: OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4',
      untaggedVlan: '1'
    }, {
      label: 'UPLINK',
      type: 'uplink',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
      untaggedVlan: '1'
    }]
  }
]

export const lineCardSlots = [
  {
    type: OltSlotType.LT,
    slots: Array.from({ length: 32 }, (_, index) => ({
      label: `S1/${index + 1}`,
      type: index === 12 ? 'lag' : '',
      status: (index === 3 || index === 5) ? OltCageStateEnum.UP : OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: OltSlotType.LT,
    slots: Array.from({ length: 16 }, (_, index) => ({
      label: `S2/${index + 1}`,
      type: index === 2 ? 'lag' : '',
      status: (index === 2 || index === 9) ? OltCageStateEnum.UP : OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  }
]

export const networkCardInfo = [{
  serialNumber: 'FH2302A073A',
  version: '%software-version%',
  uptime: '%uptime%',
  status: 'Online',
  speed: '%speed%',
  info: '%optic-info%',
  vlans: '1,2,3,4,5',
  lag: '10'
}, {
  serialNumber: 'FH2302A073A',
  version: '%software-version%',
  uptime: '%uptime%',
  status: 'Online',
  speed: '%speed%',
  info: '%optic-info%',
  vlans: '1,2,3,4,5',
  lag: '10'
}]

export const lineCardInfo = [{
  status: 'Online',
  model: 'LWLT-C',
  cages: 16,
  serialNumber: 'YP2306F4B2D'
}, {
  status: 'Online',
  model: 'LWLT-C',
  cages: 16,
  serialNumber: 'YP2306F4B2D'
}]