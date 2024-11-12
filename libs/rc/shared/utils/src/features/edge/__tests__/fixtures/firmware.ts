import { FirmwareCategory } from '../../../../types/firmware'

export const mockedVenueFirmwareList = [
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

export const mockedLatestEdgeFirmwares = [
  {
    name: '1.0.0.668',
    category: 'RECOMMENDED',
    id: '1.0.0.668',
    onboardDate: '2024-03-08 15:00:32.524',
    updatedDate: null
  },
  {
    name: '1.0.0.547',
    category: 'RECOMMENDED',
    id: '1.0.0.547',
    onboardDate: '2023-12-05 03:37:31.432',
    updatedDate: null
  },
  {
    name: '1.0.0.411',
    category: 'RECOMMENDED',
    id: '1.0.0.411',
    onboardDate: '2023-08-17 09:54:12.79',
    updatedDate: null
  },
  {
    name: '1.0.0.323',
    category: 'RECOMMENDED',
    id: '1.0.0.323',
    onboardDate: '2023-07-24 02:02:35.211',
    updatedDate: null
  }
]

export const mockAvailableVersions = [
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