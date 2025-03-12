import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [{
    status: 'new',
    statusReason: null,
    displayStatus: 'new',
    createdAt: '2024-03-06T06:03:49.850Z'
  }]
}

export const mocked = {
  id: 'ba036af1-9da9-4cb4-9732-51998856b887',
  root: 'a787653c-e53a-4575-a421-0f6fcc0e7996',
  code: 'c-bgscan5g-enable',
  sliceId: '3de93c01-980d-4d70-817e-6c50bcb4c5a5',
  status: 'new',
  statusReason: null,
  displayStatus: 'new',
  metadata: { dataEndTime: 1724112000000 },
  sliceType: 'zone',
  sliceValue: 'APMEMv6',
  path: [
    { type: 'system', name: 'AP-MEM-vSZ-61' },
    { type: 'zone', name: 'APMEMv6' }
  ],
  ...mockedStatusTrail,
  updatedAt: '2024-08-20T06:05:49.767Z',
  preferences: null,
  currentValue: null,
  recommendedValue: true,
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail
