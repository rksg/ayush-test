import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: '4bbe9991-4bbe-4052-9a9d-e6d6f442b0ba',
  root: '04442d1c-6dc3-4959-a57e-a0bc3d3b0291',
  code: 'c-dfschannels-disable',
  sliceId: '6f02e6f8-b246-4d3b-be84-957aeef1beb7',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: 'AlphaNet_5_1',
  updatedAt: '2024-09-02T00:00:00.000Z',
  // dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: '04442d1c-6dc3-4959-a57e-a0bc3d3b0291' },
    { type: 'zone', name: 'AlphaNet_5_1' }
  ],
  statusTrail: [
    { status: 'applied', createdAt: '2024-06-14T08:30:39.214Z' },
    { status: 'applyscheduleinprogress', createdAt: '2024-06-14T08:30:02.362Z' },
    { status: 'applyscheduled', createdAt: '2024-06-04T08:06:00.791Z' },
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  kpi_avg_dfs_event_count: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: 0 },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: 0 }
  },
  kpi_nax_dfs_event_count: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: 0 },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: 0 }
  },
  currentValue: 'false',
  recommendedValue: '--'
} as unknown as Intent