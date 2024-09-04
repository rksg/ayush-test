import { Intent } from '../../useIntentDetailsQuery'

export const mocked = {
  id: 'ab853454-ba3b-4ae2-9d2d-b2184c05f3c5',
  root: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8',
  code: 'c-txpower-same',
  sliceId: 'e9ff6cd2-790c-40b5-883b-87d51bf2c3a6',
  status: 'new',
  metadata: { dataEndTime: 1725235200000, failures: [] },
  sliceType: 'zone',
  sliceValue: 'CHETHAN-HOME',
  updatedAt: '2024-09-02T06:05:20.535Z',
  path: [
    { type: 'system', name: 'vsz34' },
    { type: 'domain', name: '52-IN-BDC-Analytics-CK' },
    { type: 'zone', name: 'CHETHAN-HOME' }
  ],
  statusTrail: [
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-28T06:05:53.608Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-25T06:04:20.982Z'
    },
    {
      status: 'na',
      statusReason: 'verified',
      displayStatus: 'na-verified',
      createdAt: '2024-08-24T06:04:38.206Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-23T06:04:43.160Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-22T06:04:47.170Z'
    },
    {
      status: 'new',
      statusReason: null,
      displayStatus: 'new',
      createdAt: '2024-08-21T08:01:05.586Z'
    }
  ],
  kpi_session_time_on_24_g_hz: {
    data: { timestamp: '2024-09-02T00:00:00.000Z', result: 0.9059967585089141 },
    compareData: null
  },
  currentValue: '_FULL',
  recommendedValue: '_1DB'
} as unknown as Intent