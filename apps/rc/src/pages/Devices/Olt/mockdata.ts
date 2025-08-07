import { OltStatusEnum, OltCageStateEnum, OltSlotType } from '@acx-ui/olt/utils'

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

export const networkCardSlots = [
  {
    type: OltSlotType.NT,
    ports: [{
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
      status: OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4',
      unTaggedVlan: '1'
    }, {
      label: 'UPLINK',
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec',
      taggedVlan: '2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
      unTaggedVlan: '1'
    }]
  }
]

export const lineCardSlots = [
  {
    type: OltSlotType.LT,
    ports: Array.from({ length: 32 }, (_, index) => ({
      label: `S1/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: OltSlotType.LT,
    ports: Array.from({ length: 16 }, (_, index) => ({
      label: `S2/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  }
]