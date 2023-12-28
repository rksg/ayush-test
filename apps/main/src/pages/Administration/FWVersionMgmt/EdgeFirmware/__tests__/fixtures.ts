import {
  FirmwareCategory
} from '@acx-ui/rc/utils'

export const latestReleaseVersions = [
  {
    name: '1.0.0.1710',
    category: FirmwareCategory.RECOMMENDED,
    id: '1.0.0.1710',
    createdDate: '2023-02-02T06:36:09.358+0000',
    onboardDate: '2023-02-23T09:16:05.388+0000'
  }
]

export const venueFirmwareList = [
  {
    id: '1',
    name: 'My-Venue1',
    updatedDate: '2023-02-23T09:16:05.388+0000',
    versions: [
      {
        name: '1.0.0.1709',
        id: '1.0.0.1709',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2023-02-23T09:16:05.388+0000'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2023-08-26T02:00:00-07:00',
        endDateTime: '2023-08-26T04:00:00-07:00'
      },
      version: {
        id: '10010b_b37',
        name: '10010b_b37',
        category: 'RECOMMENDED'
      }
    }
  },
  {
    id: '2',
    name: 'My-Venue2',
    updatedDate: '',
    versions: [
      {
        name: '',
        category: '',
        onboardDate: ''
      }
    ]
  },
  {
    id: '3',
    name: 'My-Venue3',
    updatedDate: '2023-02-23T09:16:05.388+0000',
    versions: [
      {
        name: '1.0.0.1711',
        id: '1.0.0.1711',
        category: FirmwareCategory.RECOMMENDED,
        onboardDate: '2023-02-23T09:16:05.388+0000'
      }
    ]
  }
]

export const availableVersions = [
  {
    name: '1.0.0.1710',
    category: FirmwareCategory.RECOMMENDED,
    id: '1.0.0.1710',
    onboardDate: '2023-02-23T09:16:05.388+0000'
  },
  {
    name: '1.0.0.1711',
    category: FirmwareCategory.RECOMMENDED,
    id: '1.0.0.1711',
    onboardDate: '2023-02-23T09:16:05.388+0000'
  },
  {
    name: '1.0.0.1712',
    category: FirmwareCategory.RECOMMENDED,
    id: '1.0.0.1712',
    onboardDate: '2023-02-23T09:16:05.388+0000'
  }
]

export const preferenceData = {
  days: [
    'Sunday',
    'Saturday'
  ],
  times: [
    '00:00-02:00',
    '02:00-04:00',
    '04:00-06:00'
  ],
  autoSchedule: true,
  betaProgram: false
}
