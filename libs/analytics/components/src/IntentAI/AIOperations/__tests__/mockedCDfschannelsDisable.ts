import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      createdAt: '2024-08-29T06:05:49.505Z',
      displayStatus: 'new',
      status: 'new',
      statusReason: null
    },
    {
      createdAt: '2024-08-28T06:05:52.459Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-26T06:04:23.226Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-25T06:04:19.712Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-24T06:04:36.897Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-23T06:04:42.071Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-22T06:04:46.051Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    },
    {
      createdAt: '2024-08-21T08:01:04.226Z',
      displayStatus: 'na-verified',
      status: 'na',
      statusReason: 'verified'
    }
  ]
}

export const mockedKPIs = {
  kpi_avg_dfs_event_count: {
    data: null,
    compareData: null
  },
  kpi_max_dfs_event_count: {
    data: null,
    compareData: null
  }
}

export const mocked = {
  id: '4bbe9991-4bbe-4052-9a9d-e6d6f442b0ba',
  root: '04442d1c-6dc3-4959-a57e-a0bc3d3b0291',
  code: 'c-dfschannels-disable',
  sliceId: '6f02e6f8-b246-4d3b-be84-957aeef1beb7',
  status: 'new',
  displayStatus: 'new',
  metadata: { failures: ['dual-5g-disabled-or-no-R760', 'for-country-us'] },
  sliceType: 'zone',
  sliceValue: 'AlphaNet_5_1',
  updatedAt: '2024-09-02T06:05:19.762Z',
  path: [
    { type: 'system', name: 'Alphanet-BDC' },
    { type: 'zone', name: 'AlphaNet_5_1' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: false,
  recommendedValue: false,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
