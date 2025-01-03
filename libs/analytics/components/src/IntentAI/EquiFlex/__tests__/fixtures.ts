import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedIntentEquiFlexStatusTrail = {
  statusTrail: [
    {
      displayStatus: 'applyscheduled',
      createdAt: '2023-06-26T06:04:52.740Z'
    },
    {
      displayStatus: 'active',
      createdAt: '2023-06-25T00:00:25.772Z'
    },
    {
      displayStatus: 'applyscheduleinprogress',
      createdAt: '2023-06-25T00:00:03.058Z'
    },
    {
      displayStatus: 'new',
      createdAt: '2023-05-17T07:04:11.663Z'
    }
  ]
}

export const mockedIntentEquiFlexKPIs = {
  avg_mgmt_traffic_per_client: {
    data: {
      timestamp: '2023-06-26T00:00:25.772Z',
      result: 2
    },
    compareData: null
  }
}

export const mockedIntentEquiFlex = {
  id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
  root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  code: 'c-probeflex-24g',
  sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
  status: 'applyscheduled',
  displayStatus: 'applyscheduled',
  updatedAt: '2023-06-26T06:04:00.000Z',
  metadata: {
    scheduledAt: '2023-07-15T14:15:00.000Z',
    dataEndTime: '2023-06-26T00:00:25.772Z'
  },
  sliceType: 'zone',
  sliceValue: '21_US_Beta_Samsung',
  path: [
    {
      type: 'system',
      name: 'vsz34'
    },
    {
      type: 'domain',
      name: '21_US_Beta_Samsung'
    },
    {
      type: 'zone',
      name: '21_US_Beta_Samsung'
    }
  ],
  ...mockedIntentEquiFlexStatusTrail,
  ...mockedIntentEquiFlexKPIs,
  preferences: null,
  currentValue: true,
  recommendedValue: true,
  dataCheck: {
    isDataRetained: true,
    isHotTierData: true
  }
} as unknown as IntentDetail

export const mockedEquiFlexKpi = {
  data: {
    timestamp: '2023-06-26T00:00:25.772Z',
    result: 2
  },
  compareData: null
}

export const mockWifiNetworkList = {
  fields: [
    'name',
    'id',
    'ssid'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'GKSS',
      id: '985a2e7fca3f43db8deb9eaf7a9c25d8',
      ssid: 'GKSS'
    },
    {
      name: 'Shine',
      id: 'e1304efc68ed48fa9e7477fe1bffe7b2',
      ssid: 'Shine'
    }
  ]
}
