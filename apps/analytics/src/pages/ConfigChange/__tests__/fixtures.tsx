export const configChanges = [
  {
    timestamp: '1685427082100',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_fly_mtbc',
    oldValues: [],
    newValues: ['480']
  },
  {
    timestamp: '1685427082200',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_select_mode',
    oldValues: [],
    newValues: [ 'BACKGROUND_SCANNING' ]
  },
  {
    timestamp: '1685427082300',
    type: 'ap',
    name: '94:B3:4F:3D:21:80',
    key: 'initialState.ccmAp.radio24g.radio.channel_width',
    oldValues: [],
    newValues: [ '_AUTO']
  }
]

export const kpiChanges = {
  before: {
    connectionSuccess: 0.7476334721696327,
    timeToConnect: 895.2461538461538,
    clientThroughPut: 232617.69735006973,
    apCapacity: 10,
    apUpTime: null,
    onlineAPCount: 7
  },
  after: {
    connectionSuccess: 0.692,
    timeToConnect: 26,
    clientThroughPut: null,
    apCapacity: null,
    apUpTime: null,
    onlineAPCount: 3
  }
}