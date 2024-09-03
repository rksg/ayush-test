import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: 'effb97a3-2a9b-4106-9db1-4ca0536784aa',
  root: '3e1e8f94-d078-4df0-ab11-bc5a5a73eeff',
  code: 'c-bandbalancing-enable-below-61',
  sliceId: '506b0a29-1cd6-4ad8-bc5f-f17374595b81',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: 'Vani',
  updatedAt: '2024-09-02T00:00:00.000Z',
  dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: '3e1e8f94-d078-4df0-ab11-bc5a5a73eeff' },
    { type: 'zone', name: 'Vani' }
  ],
  statusTrail: [
    { status: 'applied', createdAt: '2024-06-14T08:30:39.214Z' },
    { status: 'applyscheduleinprogress', createdAt: '2024-06-14T08:30:02.362Z' },
    { status: 'applyscheduled', createdAt: '2024-06-04T08:06:00.791Z' },
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  kpi_client_ratio: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: 0 },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: 0 }
  },
  currentValue: '--',
  recommendedValue: '--'
} as unknown as Intent