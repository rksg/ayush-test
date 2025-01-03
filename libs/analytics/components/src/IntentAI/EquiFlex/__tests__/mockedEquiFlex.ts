import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    { status: 'new', createdAt: '2024-04-03T06:03:59.617Z' }
  ]
}

export const mockedKPIs = {
  kpi_avg_mgmt_traffic_per_client: {
    data: {
      timestamp: '2024-08-25T00:00:00.000Z',
      result: 992883975.0873108
    },
    compareData: null
  }
}

export const mocked = {
  id: '2c392d0a-124f-4183-b5c4-529d6571f540',
  root: '3e93a325-c53c-4bdb-876f-ced1f59ca820',
  code: 'c-probeflex-5g',
  sliceId: '5f46ced9-03b8-4cf1-89f1-fac17afdf421',
  status: 'new',
  sliceType: 'zone',
  sliceValue: 'weiguo-mesh',
  updatedAt: '2024-06-14T08:30:39.214Z',
  dataEndTime: '2024-06-09T00:00:00.000Z',
  path: [
    { type: 'system', name: 'vsz-bruce' },
    { type: 'zone', name: 'weiguo-mesh' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: false,
  metadata: {
    wlans: [
      {
        name: 'DENSITY-GUEST',
        ssid: 'DENSITY-GUEST'
      },
      {
        name: 'DENSITY',
        ssid: 'DENSITY'
      }
    ]
  },
  dataCheck: {
    isDataRetained: true,
    isHotTierData: true
  }
} as unknown as IntentDetail
