import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [{
    status: 'new',
    statusReason: null,
    displayStatus: 'new',
    createdAt: '2024-08-28T06:05:53.608Z'
  }]
}

export const mockedKPIs = {
  statusTrail: [{
    status: 'new',
    statusReason: null,
    displayStatus: 'new',
    createdAt: '2024-08-28T06:05:53.608Z'
  }]
}

export const mocked = {
  id: 'ab853454-ba3b-4ae2-9d2d-b2184c05f3c5',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-txpower-same',
  sliceId: 'e9ff6cd2-790c-40b5-883b-87d51bf2c3a6',
  status: 'new',
  displayStatus: 'new',
  metadata: { dataEndTime: 1725235200000, failures: [] },
  sliceType: 'zone',
  sliceValue: 'CHETHAN-HOME',
  updatedAt: '2024-09-02T06:05:20.535Z',
  path: [
    { type: 'system', name: 'vsz34' },
    { type: 'domain', name: '52-IN-BDC-Analytics-CK' },
    { type: 'zone', name: 'CHETHAN-HOME' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  currentValue: 'Full',
  recommendedValue: '-1dB',
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
