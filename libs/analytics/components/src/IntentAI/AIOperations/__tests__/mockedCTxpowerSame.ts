import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: 'ab853454-ba3b-4ae2-9d2d-b2184c05f3c5',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-txpower-same',
  sliceId: 'e9ff6cd2-790c-40b5-883b-87d51bf2c3a6',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: 'CHETHAN-HOME',
  updatedAt: '2024-09-02T00:00:00.000Z',
  dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
    { type: 'zone', name: 'CHETHAN-HOME' }
  ],
  statusTrail: [
    { status: 'applied', createdAt: '2024-06-14T08:30:39.214Z' },
    { status: 'applyscheduleinprogress', createdAt: '2024-06-14T08:30:02.362Z' },
    { status: 'applyscheduled', createdAt: '2024-06-04T08:06:00.791Z' },
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  kpi_session_time_on_24GHz: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: [ 0, 0 ] },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: [ 0, 0 ] }
  },
  currentValue: '_FULL',
  recommendedValue: '_1DB'
} as unknown as Intent