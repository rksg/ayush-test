import { FirmwareCategory, SwitchFirmwareStatusType } from '@acx-ui/rc/utils'

export const mockVenue = {
  id: '1444c6702e904fa289f21d49093ba239',
  name: 'Mock-Venue1',
  switchFirmwareVersion: {
    id: '09010e_b392',
    name: '09010e_b392',
    category: FirmwareCategory.RECOMMENDED
  },
  switchFirmwareVersionAboveTen: {
    id: '10010_rc3',
    name: '10010_rc3',
    category: FirmwareCategory.RECOMMENDED
  },
  availableVersions: [
    {
      id: '09010h_cd2_b4',
      name: '09010h_cd2_b4',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '10010a_cd3_b11',
      name: '10010a_cd3_b11',
      category: FirmwareCategory.RECOMMENDED
    }
  ],
  nextSchedule: {
    timeSlot: {
      startDateTime: '2023-11-01T00:00:00-07:00',
      endDateTime: '2023-11-01T02:00:00-07:00'
    },
    version: {
      id: '09010h_cd2_b4',
      name: '09010h_cd2_b4',
      category: FirmwareCategory.RECOMMENDED
    },
    versionAboveTen: {
      id: '10010a_cd3_b11',
      name: '10010a_cd3_b11',
      category: FirmwareCategory.RECOMMENDED
    }
  },
  lastScheduleUpdateTime: '2023-10-19T10:04:14.370+00:00',
  preDownload: false,
  switchCount: 2,
  aboveTenSwitchCount: 0,
  status: SwitchFirmwareStatusType.NONE,
  scheduleCount: 2,
  upgradeVenueViewList: null
}

export const mockSwitchVenue = {
  id: 'FEK1224R0AG',
  venueId: '1444c6702e904fa289f21d49093ba239',
  venueName: 'KittoVenue1',
  switchId: 'FEK1224R0AG',
  switchName: 'mock switch',
  isStack: false,
  isSwitchLevelSchedule: true,
  model: 'ICX7150-C12P',
  switchNextSchedule: {
    timeSlot: {
      startDateTime: '2023-11-02T00:00:00-07:00',
      endDateTime: '2023-11-02T02:00:00-07:00'
    },
    version: {
      id: '09010f_b19',
      name: '09010f_b19',
      category: FirmwareCategory.RECOMMENDED
    },
    versionAboveTen: {
      id: '10010a_cd3_b11',
      name: '10010a_cd3_b11',
      category: FirmwareCategory.RECOMMENDED
    }
  },
  currentFirmware: '',
  venueNextSchedule: {
    timeSlot: {
      startDateTime: '2023-11-02T00:00:00-07:00',
      endDateTime: '2023-11-02T02:00:00-07:00'
    },
    version: {
      id: '09010f_b19',
      name: '09010f_b19',
      category: FirmwareCategory.RECOMMENDED
    },
    versionAboveTen: {
      id: '10010a_cd3_b11',
      name: '10010a_cd3_b11',
      category: FirmwareCategory.RECOMMENDED
    }
  },
  availableVersion: {
    id: '09010h_cd2_b4',
    name: '09010h_cd2_b4',
    category: FirmwareCategory.RECOMMENDED
  },
  availableVersions: [
    {
      id: '09010h_cd2_b4',
      name: '09010h_cd2_b4',
      category: FirmwareCategory.RECOMMENDED
    },
    {
      id: '10010a_cd3_b11',
      name: '10010a_cd3_b11',
      category: FirmwareCategory.RECOMMENDED
    }
  ],
  preDownload: false,
  upgradeSwitchViewList: null
}

export const availableVersionsV1002 = [
  {
    modelGroup: 'ICX7X',
    versions: [
      {
        id: '10010_rc3',
        name: '10010_rc3',
        category: 'RECOMMENDED',
        createdDate: '2024-05-23T03:54:07.867+00:00'
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'RECOMMENDED',
        createdDate: '2024-05-22T07:21:52.693+00:00'
      },
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:50.553+00:00'
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:46.772+00:00'
      }
    ]
  },
  {
    modelGroup: 'ICX82',
    versions: [
      {
        id: '10010_rc3',
        name: '10010_rc3',
        category: 'RECOMMENDED',
        createdDate: '2024-05-23T03:54:07.867+00:00'
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'RECOMMENDED',
        createdDate: '2024-05-22T07:21:52.693+00:00'
      },
      {
        id: '10010a_cd1_b3',
        name: '10010a_cd1_b3',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:12:47.128+00:00'
      }
    ]
  },
  {
    modelGroup: 'ICX71',
    versions: [
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:50.553+00:00'
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:46.772+00:00'
      },
      {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:06.337+00:00'
      }
    ]
  }
]

export const defaultVersionsV1002 = [
  {
    modelGroup: 'ICX7X',
    versions: [
      {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: 'RECOMMENDED',
        createdDate: '2024-06-13T10:28:39.950+00:00'
      }
    ]
  },
  {
    modelGroup: 'ICX82',
    versions: [
      {
        id: '10010b_rc88',
        name: '10010b_rc88',
        category: 'RECOMMENDED',
        createdDate: '2024-06-13T10:28:39.950+00:00'
      }
    ]
  },
  {
    modelGroup: 'ICX71',
    versions: [
      {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: 'RECOMMENDED',
        createdDate: '2024-06-13T10:28:39.950+00:00'
      }
    ]
  }
]
