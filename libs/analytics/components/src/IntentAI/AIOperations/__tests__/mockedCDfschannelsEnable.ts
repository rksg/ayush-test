import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-29T06:05:49.505Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-28T06:05:52.674Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-27T06:04:24.929Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-26T06:04:23.391Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-25T06:04:19.883Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-24T06:04:37.169Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-23T06:04:42.217Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-22T06:04:46.250Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-21T08:01:04.441Z'
    }
  ]
}

export const mockedKPIs = {
  kpi_co_channel_interference_ratio: {
    data: null,
    compareData: null
  }
}

export const mocked = {
  id: '1201552d-bc77-49a1-a727-b630afab43c8',
  root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  code: 'c-dfschannels-enable',
  sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
  status: 'new',
  displayStatus: 'new',
  metadata: { failures: ['dfs-channel-5g-disabled'] },
  sliceType: 'zone',
  sliceValue: 'pazhyannur-zone',
  updatedAt: '2024-09-02T06:05:19.896Z',
  path: [
    { type: 'system', name: 'anindya-vsz-e-cluster' },
    { type: 'zone', name: 'pazhyannur-zone' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: false,
  recommendedValue: true,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
