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
