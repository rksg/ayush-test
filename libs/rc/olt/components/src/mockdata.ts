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
    slots: Array.from({ length: 32 }, (_, index) => ({
      label: `S1/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  },
  {
    type: OltSlotType.LT,
    slots: Array.from({ length: 16 }, (_, index) => ({
      label: `S2/${index + 1}`,
      status: OltCageStateEnum.UP,
      info: '%info%',
      portSpeed: '1 Gb/sec'
    }))
  }
]