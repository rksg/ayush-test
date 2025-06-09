import { IntentDetail } from '../../useIntentDetailsQuery'

export const excludedHours= {
  sun: [],
  mon: [
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23
  ],
  tue: [
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23
  ],
  wed: [
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23
  ],
  thu: [
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23
  ],
  fri: [
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23
  ],
  sat: []
}

export const mockedIntentEcoFlexStatusTrail = {
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

export const mockedIntentEcoFlex = {
  id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
  root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
  code: 'i-ecoflex',
  sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
  status: 'applyscheduled',
  displayStatus: 'applyscheduled',
  updatedAt: '2023-06-26T06:04:00.000Z',
  metadata: {
    scheduledAt: '2023-07-15T14:15:00.000Z',
    dataEndTime: '2023-06-26T00:00:25.772Z',
    preferences: {
      excludedHours
    }
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
  ...mockedIntentEcoFlexStatusTrail,
  preferences: null,
  dataCheck: {
    isDataRetained: true,
    isHotTierData: true
  }
} as unknown as IntentDetail

export const mockedIntentAIPowerSavePlan = {
  apPowerSaveDistribution: [
    {
      date: '2025-05-09T02:15:52Z',
      name: null,
      mac: '00:00:00:00:00:04',
      model: null,
      powerSave: 'On',
      wakeupTime: '2025-05-16T03:00:000Z',
      status: 'scheduled'
    },
    {
      date: '2025-05-09T02:15:52Z',
      name: 'floor3',
      mac: '00:00:00:00:00:03',
      model: 'R712',
      powerSave: 'On',
      wakeupTime: '2025-05-16T03:00:000Z',
      status: 'scheduled'
    },
    {
      date: '2025-05-09T02:15:52Z',
      name: 'floor2',
      mac: '00:00:00:00:00:02',
      model: 'R712',
      powerSave: 'On',
      wakeupTime: '2025-04-16T03:00:000Z',
      status: 'scheduled'
    },
    {
      date: '2025-05-09T02:15:52Z',
      name: 'floor1',
      mac: '00:00:00:00:00:01',
      model: 'R711',
      powerSave: 'On',
      wakeupTime: '2025-04-16T03:00:000Z',
      status: 'scheduled'
    }
  ]
}