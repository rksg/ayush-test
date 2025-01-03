import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [{
    status: 'new',
    statusReason: null,
    displayStatus: 'new',
    createdAt: '2024-08-20T06:05:49.507Z'
  }]
}

export const mockedKPIs = {
  kpi_avg_ap_channel_change_count: {
    data: { timestamp: '2024-08-20T00:00:00.000Z', result: 21 },
    compareData: null
  },
  kpi_max_ap_channel_change_count: {
    data: { timestamp: '2024-08-20T00:00:00.000Z', result: 63 },
    compareData: null
  },
  kpi_co_channel_interference_ratio: {
    data: { timestamp: '2024-08-20T00:00:00.000Z', result: null },
    compareData: null
  }
}

export const mocked = {
  id: '94aea205-8d11-4636-b686-805c59113cd4',
  root: 'b6d837b5-9445-497c-8539-cdc06b891496',
  code: 'c-bgscan5g-timer',
  sliceId: '3b3802b2-0ce9-4efd-b2ce-96e3ac78c332',
  status: 'new',
  statusReason: null,
  displayStatus: 'new',
  metadata: { dataEndTime: 1724112000000 },
  sliceType: 'zone',
  sliceValue: 'Aaron M510 Mesh',
  path: [
    { type: 'system', name: 'Aaron-Public-1' },
    { type: 'zone', name: 'Aaron M510 Mesh' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  updatedAt: '2024-08-20T06:05:49.507Z',
  preferences: null,
  currentValue: 220000,
  recommendedValue: 20000,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
