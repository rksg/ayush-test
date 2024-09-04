import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: '673b113c-b780-4ae8-9457-56b0d46a0e0a',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-bandbalancing-proactive',
  sliceId: '145208f3-1633-4607-9298-ee8ee8ae16f1',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: '26-US-CA-D26-Leslie-Mother-home',
  updatedAt: '2024-09-02T00:00:00.000Z',
  dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
    { type: 'zone', name: '26-US-CA-D26-Leslie-Mother-home' }
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
  currentValue: 'Basic',
  recommendedValue: 'Proactive'
} as unknown as Intent