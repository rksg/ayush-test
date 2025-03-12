import { IntentDetail } from '../../useIntentDetailsQuery'

export const mockedStatusTrail = {
  statusTrail: [{
    status: 'new',
    statusReason: null,
    displayStatus: 'new',
    createdAt: '2024-08-29T06:05:30.464Z'
  }]
}

export const mockedKPIs = {
  kpi_aps_on_latest_fw_version: {
    data: { timestamp: '2024-08-29T00:00:00.000Z', result: [ 0, 0 ] },
    compareData: { timestamp: '2024-06-09T00:00:00.000Z', result: [ 0, 0 ] }
  }
}

export const mocked = {
  id: '2c392d0a-124f-4183-b5c4-529d6571f540',
  root: '3e93a325-c53c-4bdb-876f-ced1f59ca820',
  code: 'i-zonefirmware-upgrade',
  sliceId: '5f46ced9-03b8-4cf1-89f1-fac17afdf421',
  status: 'new',
  statusReason: null,
  displayStatus: 'new',
  metadata: { dataEndTime: 1724889600000 },
  sliceType: 'zone',
  sliceValue: 'weiguo-mesh',
  path: [
    { type: 'system', name: 'vsz-bruce' },
    { type: 'zone', name: 'weiguo-mesh' }
  ],
  ...mockedStatusTrail,
  ...mockedKPIs,
  updatedAt: '2024-08-29T06:05:30.464Z',
  preferences: null,
  currentValue: null,
  recommendedValue: '7.0.0',
  dataCheck: {
    isDataRetained: true,
    isHotTierDate: true
  }
} as unknown as IntentDetail

export const mockedIntentAps = [
  {
    name: 'RuckusAP',
    mac: '28:B3:71:27:38:E0',
    model: 'R650',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'B4:79:C8:3E:7E:50',
    model: 'R550',
    version: 'Unknown'
  },
  {
    name: 'RuckusAP',
    mac: 'C8:84:8C:3E:46:B0',
    model: 'R560',
    version: 'Unknown'
  }
]
