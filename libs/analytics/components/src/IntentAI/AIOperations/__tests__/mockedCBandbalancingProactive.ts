import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-09-02T06:05:18.305Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-31T06:05:13.510Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-30T06:05:36.411Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-28T06:05:50.391Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-25T06:04:17.832Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-24T06:04:34.757Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-23T06:04:39.999Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-22T06:04:44.008Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-21T08:01:01.045Z'
    }
  ]
}

export const mockedKPIs = {
  kpi_client_ratio: {
    data: { timestamp: '2024-09-02T00:00:00.000Z', result: 1 },
    compareData: null
  }
}

export const mocked = {
  id: '673b113c-b780-4ae8-9457-56b0d46a0e0a',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-bandbalancing-proactive',
  sliceId: '145208f3-1633-4607-9298-ee8ee8ae16f1',
  status: 'new',
  displayStatus: 'new',
  metadata: { failures: [], dataEndTime: 1725235200000 },
  sliceType: 'zone',
  sliceValue: '26-US-CA-D26-Leslie-Mother-home',
  updatedAt: '2024-09-02T06:05:18.305Z',
  path: [
    { type: 'system', name: 'vsz34' },
    { type: 'domain', name: '26-US-CA-D26-Leslie-home' },
    { type: 'zone', name: '26-US-CA-D26-Leslie-Mother-home' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: 'BASIC',
  recommendedValue: 'PROACTIVE',
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
