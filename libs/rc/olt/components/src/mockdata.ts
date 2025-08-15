import { OltCageStateEnum, OltSlotType } from '@acx-ui/olt/utils'

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
      status: index % 10 === 0 ? OltCageStateEnum.UP : OltCageStateEnum.DOWN,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: OltSlotType.LT,
    slots: Array.from({ length: 16 }, (_, index) => ({
      label: `S2/${index + 1}`,
      type: index === 2 ? 'lag' : '',
      status: index === 9 ? OltCageStateEnum.UP : OltCageStateEnum.DOWN,
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