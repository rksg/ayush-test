import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: 'aea148e1-05a1-4ffa-a866-2a21cd69fba6',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-bandbalancing-enable',
  sliceId: 'f3f207c0-776c-4ce7-9e6f-d12d9b9f0fe1',
  status: 'active',
  metadata: {},
  sliceType: 'zoneName',
  sliceValue: '14-US-CA-D14-Ken-Home',
  updatedAt: '2024-09-02T00:00:00.000Z',
  dataEndTime: '2024-09-02T00:00:00.000Z',
  path: [
    { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
    { type: 'zone', name: '14-US-CA-D14-Ken-Home' }
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
  currentValue: 'Enabled',
  recommendedValue: 'Disabled'
} as unknown as Intent