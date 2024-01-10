import { FirmwareCategory } from '@acx-ui/rc/utils'

/* eslint-disable max-len */
export const successResponse = {
  requestId: 'request-id'
}

export const preference = {
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


export const upgradeSwitchViewList = {
  upgradeSwitchViewList: [
    {
      venueId: '1444c6702e904fa289f21d49093ba239',
      venueName: 'Karen-Venue1',
      switchId: 'FEK1224R0AG',
      switchName: 'mock switch',
      isStack: false,
      model: 'ICX7150-C12P',
      availableVersion: {},
      preDownload: false,
      upgradeSwitchViewList: {}
    },
    {
      venueId: '1444c6702e904fa289f21d49093ba239',
      venueName: 'Karen-Venue1',
      switchId: 'c0:c5:20:aa:32:79',
      switchName: 'FEK3224R0AG',
      isStack: false,
      model: 'ICX7150-C12P',
      currentFirmware: '09010f',
      availableVersion: {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: 'RECOMMENDED'
      },
      switchNextSchedule: {
        timeSlot: {
          startDateTime: '2023-11-02T06:00:00-07:00',
          endDateTime: '2023-11-02T08:00:00-07:00'
        },
        version: {
          id: '09010h_cd2_b4',
          name: '09010h_cd2_b4',
          category: 'RECOMMENDED'
        },
        versionAboveTen: {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: 'RECOMMENDED'
        }
      },
      preDownload: false,
      upgradeSwitchViewList: {}
    }
  ]
}

export const switchVenue = {
  upgradeVenueViewList: [
    {
      id: 'e070393078b54a8d8345d18a064c02c1',
      name: 'KittoVenue2',
      switchFirmwareVersion: {
        id: '09010h_rc1',
        name: '09010h_rc1',
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
      lastScheduleUpdateTime: '2023-10-31T08:43:01.740+00:00',
      preDownload: true,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      status: 'NONE',
      scheduleCount: 1,
      upgradeVenueViewList: null
    },
    {
      id: 'fabec10fa55649cab8ab01cc4f792e07',
      name: 'KittoVenue1',
      switchFirmwareVersion: {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
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
      lastScheduleUpdateTime: '2023-10-31T03:14:16.085+00:00',
      preDownload: false,
      switchCount: 2,
      aboveTenSwitchCount: 0,
      status: 'INITIATE',
      scheduleCount: 0,
      upgradeVenueViewList: null
    },
    {
      id: 'f6f73caebffd4213929746a1d6ec32c0',
      name: 'Karen-Venue2',
      switchFirmwareVersion: {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
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
          startDateTime: '2023-10-28T00:00:00-07:00',
          endDateTime: '2023-10-28T02:00:00-07:00'
        },
        version: {
          id: '09010h_rc1',
          name: '09010h_rc1',
          category: FirmwareCategory.RECOMMENDED
        },
        versionAboveTen: {
          id: '10010a_cd3_b11',
          name: '10010a_cd3_b11',
          category: FirmwareCategory.RECOMMENDED
        }
      },
      lastScheduleUpdateTime: '2023-10-28T07:00:00.435+00:00',
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      status: 'NONE',
      scheduleCount: 1,
      upgradeVenueViewList: null
    },
    {
      id: 'f12f27caaddc432596419c7adf09937e',
      name: 'My-Venue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
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
      lastScheduleUpdateTime: '2023-10-27T07:58:00.266+00:00',
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      status: 'NONE',
      scheduleCount: 0,
      upgradeVenueViewList: null
    },
    {
      id: '1444c6702e904fa289f21d49093ba239',
      name: 'Karen-Venue1',
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
      status: 'NONE',
      scheduleCount: 2,
      upgradeVenueViewList: null
    }
  ]
}

export const switchVenueWithEmptyFirmware = {
  upgradeVenueViewList: [
    {
      id: '0c421425798748ddb01cf7ca744500d4',
      name: 'My-Venue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
        category: FirmwareCategory.RECOMMENDED
      },
      switchFirmwareVersionAboveTen: {
        id: '10010_rc3',
        name: '10010_rc3',
        category: FirmwareCategory.RECOMMENDED
      },
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 0,
      status: 'NONE',
      scheduleCount: 0,
      upgradeVenueViewList: null
    },
    {
      id: '7d4f45940c30448e97f36add4f332bb8',
      name: 'test',
      switchFirmwareVersion: {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: FirmwareCategory.RECOMMENDED
      },
      switchFirmwareVersionAboveTen: {
        id: '10010a_cd3_b11',
        name: '10010a_cd3_b11',
        category: FirmwareCategory.RECOMMENDED
      },
      preDownload: false,
      switchCount: 0,
      aboveTenSwitchCount: 2,
      status: 'NONE',
      scheduleCount: 0,
      upgradeVenueViewList: null
    }
  ]
}

export const switchLatest = [
  {
    id: '09010f_b401',
    name: '09010f_b401',
    category: FirmwareCategory.RECOMMENDED,
    createdDate: '2023-02-14T20:24:24.604+00:00'
  }
]

export const switchRelease = [
  {
    id: '09010e_b392',
    name: '09010e_b392',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010f_b19',
    name: '09010f_b19',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010f_b401',
    name: '09010f_b401',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010f_b403',
    name: '09010f_b403',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_b176',
    name: '10010_b176',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc2',
    name: '10010_rc2',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc3',
    name: '10010_rc3',
    category: FirmwareCategory.RECOMMENDED
  }
]

export const switchUpgradeStatusDetails_KittoVenue1 = {
  upgradeStatusDetailsViewList: [
    {
      id: 'c0:c5:20:98:b0:43',
      switchId: 'c0:c5:20:98:b0:43',
      switchName: 'ICX7150-C12 Router',
      upgradeStatusDetailsViewList: null
    },
    {
      id: 'd4:c1:9e:15:f7:2d',
      switchId: 'd4:c1:9e:15:f7:2d',
      switchName: 'DEV-EZD3317P008',
      status: 'FW_UPD_FAIL',
      targetFirmware: '09010f_b19',
      upgradeStatusDetailsViewList: null
    },
    {
      id: 'c0:c5:20:aa:32:55',
      switchId: 'c0:c5:20:aa:32:55',
      switchName: 'FEK3224R0AA',
      status: 'FW_UPD_COMPLETE',
      targetFirmware: '09010h_cd2_b4',
      upgradeStatusDetailsViewList: null
    }
  ]
}


export const upgradeSwitchViewList_KittoVenue1 ={
  upgradeSwitchViewList: [
    {
      venueId: '1444c6702e904fa289f21d49093ba239',
      venueName: 'KittoVenue1',
      switchId: 'FEK1224R0AG',
      switchName: 'mock switch',
      isStack: false,
      isSwitchLevelSchedule: true,
      model: 'ICX7150-C12P',
      availableVersion: {},
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
      preDownload: false,
      upgradeSwitchViewList: null
    },
    {
      venueId: '1444c6702e904fa289f21d49093ba239',
      venueName: 'KittoVenue1',
      switchId: 'c0:c5:20:aa:32:79',
      isSwitchLevelSchedule: true,
      switchName: 'FEK3224R0AG',
      isStack: false,
      model: 'ICX7150-C12P',
      currentFirmware: '09010f',
      availableVersion: {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: FirmwareCategory.RECOMMENDED
      },
      switchNextSchedule: {
        timeSlot: {
          startDateTime: '2023-11-02T06:00:00-07:00',
          endDateTime: '2023-11-02T08:00:00-07:00'
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
      preDownload: false,
      upgradeSwitchViewList: null
    }
  ]
}

export const availableVersions = [
  {
    id: '09010e_b392',
    name: '09010e_b392',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010h_rc1',
    name: '09010h_rc1',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010h_cd2_b4',
    name: '09010h_cd2_b4',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010f_b19',
    name: '09010f_b19',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc2',
    name: '10010_rc2',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010a_cd3_b11',
    name: '10010a_cd3_b11',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc3',
    name: '10010_rc3',
    category: FirmwareCategory.RECOMMENDED
  }
]

export const availableVersions_hasInUse = [
  {
    id: '09010e_b392',
    name: '09010e_b392',
    category: FirmwareCategory.RECOMMENDED,
    inUse: true
  },
  {
    id: '09010h_rc1',
    name: '09010h_rc1',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010h_cd2_b4',
    name: '09010h_cd2_b4',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '09010f_b19',
    name: '09010f_b19',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc2',
    name: '10010_rc2',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010a_cd3_b11',
    name: '10010a_cd3_b11',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '10010_rc3',
    name: '10010_rc3',
    category: FirmwareCategory.RECOMMENDED
  }
]
