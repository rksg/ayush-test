import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [
    {
      status: 'active',
      statusReason: null,
      displayStatus: 'active',
      createdAt: '2024-08-07T04:30:33.273Z'
    },
    {
      status: 'applyscheduleinprogress',
      statusReason: null,
      displayStatus: 'applyscheduleinprogress',
      createdAt: '2024-08-07T04:30:02.196Z'
    },
    {
      status: 'applyscheduled',
      statusReason: null,
      displayStatus: 'applyscheduled',
      createdAt: '2024-08-07T04:13:18.596Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-07-30T06:05:09.787Z'
    }
  ]
}

export const mockedKPIs = {
  kpi_client_ratio: {
    data: { timestamp: '2024-09-04T07:04:53.000Z', result: 1 },
    compareData: { timestamp: '2024-08-06T00:00:00.000Z', result: 1 }
  }
}

export const mocked = {
  id: 'aea148e1-05a1-4ffa-a866-2a21cd69fba6',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-bandbalancing-enable',
  sliceId: 'f3f207c0-776c-4ce7-9e6f-d12d9b9f0fe1',
  status: 'active',
  displayStatus: 'active',
  metadata: { failures: ['band-balancing-disabled-zone-6.1'], dataEndTime: 1722902400000 },
  sliceType: 'zone',
  sliceValue: '14-US-CA-D14-Ken-Home',
  updatedAt: '2024-09-02T06:05:18.015Z',
  path: [
    { type: 'system', name: 'vsz34' },
    { type: 'domain', name: '14-US-CA-D14-Ken-Home' },
    { type: 'zone', name: '14-US-CA-D14-Ken-Home' }
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
