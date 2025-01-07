import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-28T06:05:49.930Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-27T06:04:22.882Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-26T06:04:21.116Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-25T06:04:17.446Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-24T06:04:34.201Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-23T06:04:39.502Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-22T06:04:43.474Z'
    },
    {
      status: 'na',
      statusReason: 'no-aps',
      displayStatus: 'na-no-aps',
      createdAt: '2024-08-21T08:01:00.105Z'
    }
  ]
}

export const mockedKPIs = {
  kpi_client_ratio: {
    data: null,
    compareData: null
  }
}

export const mocked = {
  id: 'effb97a3-2a9b-4106-9db1-4ca0536784aa',
  root: '3e1e8f94-d078-4df0-ab11-bc5a5a73eeff',
  code: 'c-bandbalancing-enable-below-61',
  sliceId: '506b0a29-1cd6-4ad8-bc5f-f17374595b81',
  status: 'na',
  displayStatus: 'na',
  metadata: { failures: ['no-aps'] },
  sliceType: 'zone',
  sliceValue: 'Vani',
  updatedAt: '2024-09-02T06:05:18.015Z',
  path: [
    { type: 'system', name: 'vsz-h-bdc-home-network-05' },
    { type: 'zone', name: 'Vani' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: null,
  recommendedValue: null,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
