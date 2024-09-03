import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: '49033f10-eeae-4318-bae2-5cf52ebc0319',
  root: '6f931c53-21eb-4727-b2ad-e23b43d98846',
  code: 'c-aclb-enable',
  sliceId: 'dff976ca-a4ea-4f6c-ab63-cb8e4a886df6',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: 'Yakubpur-MH',
  updatedAt: '2024-09-02T00:00:00.000Z',
  dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: '6f931c53-21eb-4727-b2ad-e23b43d98846' },
    { type: 'zone', name: 'Yakubpur-MH' }
  ],
  statusTrail: [
    { status: 'applied', createdAt: '2024-06-14T08:30:39.214Z' },
    { status: 'applyscheduleinprogress', createdAt: '2024-06-14T08:30:02.362Z' },
    { status: 'applyscheduled', createdAt: '2024-06-04T08:06:00.791Z' },
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ],
  kpi_avg_ap_unique_client_count: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: 0 },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: 0 }
  },
  kpi_max_ap_unique_client_count: {
    data: { timestamp: '2024-08-29T08:30:00.000Z', result: 0 },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: 0 }
  },
  currentValue: 'Enabled',
  recommendedValue: 'Disabled'
} as unknown as Intent