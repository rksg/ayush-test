import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-28T06:05:49.505Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-27T06:04:22.607Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-26T06:04:20.878Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-25T06:04:17.071Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-24T06:04:33.732Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-23T06:04:39.085Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-22T06:04:43.005Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-21T08:00:59.630Z'
    }
  ]
}

export const mockedKPIs = {
  kpi_avg_ap_unique_client_count: {
    data: { timestamp: '2024-09-02T00:00:00.000Z', result: 1 },
    compareData: null
  },
  kpi_max_ap_unique_client_count: {
    data: { timestamp: '2024-09-02T00:00:00.000Z', result: 2 },
    compareData: null
  }
}

export const mocked = {
  id: '49033f10-eeae-4318-bae2-5cf52ebc0319',
  root: '6f931c53-21eb-4727-b2ad-e23b43d98846',
  code: 'c-aclb-enable',
  sliceId: 'dff976ca-a4ea-4f6c-ab63-cb8e4a886df6',
  status: 'new',
  displayStatus: 'new',
  metadata: { failures: [], dataEndTime: 1725235200000 },
  sliceType: 'zone',
  sliceValue: 'Yakubpur-MH',
  updatedAt: '2024-09-02T06:05:17.619Z',
  path: [
    { type: 'system', name: 'SZ300-115' },
    { type: 'domain', name: 'MH' },
    { type: 'zone', name: 'Yakubpur-MH' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: true,
  recommendedValue: true,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
