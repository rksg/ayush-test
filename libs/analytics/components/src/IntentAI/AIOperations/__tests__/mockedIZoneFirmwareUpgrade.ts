import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: '2c392d0a-124f-4183-b5c4-529d6571f540',
  root: '3e93a325-c53c-4bdb-876f-ced1f59ca820',
  code: 'i-zonefirmware-upgrade',
  sliceId: '5f46ced9-03b8-4cf1-89f1-fac17afdf421',
  status: 'applied',
  metadata: {},
  sliceType: 'zone',
  sliceValue: 'weiguo-mesh',
  updatedAt: '2024-06-14T08:30:39.214Z',
  dataEndTime: '2024-06-09T00:00:00.000Z',
  path: [
    { type: 'system', name: 'vsz-bruce' },
    { type: 'zone', name: 'weiguo-mesh' }
  ],
  statusTrail: [
    { status: 'applied', createdAt: '2024-06-14T08:30:39.214Z' },
    { status: 'applyscheduleinprogress', createdAt: '2024-06-14T08:30:02.362Z' },
    { status: 'applyscheduled', createdAt: '2024-06-04T08:06:00.791Z' },
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  kpi_aps_on_latest_fw_version: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: [ 0, 0 ] },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: [ 0, 0 ] }
  },
  currentValue: null,
  recommendedValue: '7.0.0'
} as unknown as Intent

export const mockedIntentAps = [
  {
    name: 'RuckusAP',
    mac: '28:B3:71:27:38:E0',
    model: 'R650',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'B4:79:C8:3E:7E:50',
    model: 'R550',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'C8:84:8C:3E:46:B0',
    model: 'R560',
    version: 'Unknown'
  }
]