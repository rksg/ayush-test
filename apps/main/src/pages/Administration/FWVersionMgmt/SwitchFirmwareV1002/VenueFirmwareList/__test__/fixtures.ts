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

export const switchReleaseV1002 = [
  {
    modelGroup: 'ICX7X',
    versions: [
      {
        id: '10010_rc55',
        name: '10010_rc55',
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
    modelGroup: 'ICX71',
    versions: [
      {
        id: '09010f_b71',
        name: '09010f_b71',
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
  },
  {
    modelGroup: 'ICX82',
    versions: [
      {
        id: '10010_rc82',
        name: '10010_rc82',
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
      switchStatus: 'FIRMWARE_UPGRADING',
      targetFirmware: '09010f_b19',
      upgradeStatusDetailsViewList: null
    },
    {
      id: 'c0:c5:20:aa:32:55',
      switchId: 'c0:c5:20:aa:32:55',
      switchName: 'FEK3224R0AA',
      status: 'FW_UPD_COMPLETE',
      switchStatus: 'ONLINE',
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
    modelGroup: 'ICX82',
    switchCount: 0,
    versions: [
      {
        id: '10010_rc3_icx82',
        name: '10010_rc3_icx82',
        category: 'REGULAR',
        createdDate: '2024-05-23T03:54:07.867+00:00',
        isDowngradeVersion: true
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'REGULAR',
        createdDate: '2024-05-22T07:21:52.693+00:00',
        isDowngradeVersion: true
      },
      {
        id: '10010a_cd1_b3',
        name: '10010a_cd1_b3',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:12:47.128+00:00',
        isDowngradeVersion: true
      }
    ]
  },
  {
    modelGroup: 'ICX7X',
    switchCount: 0,
    versions: [
      {
        id: '10010_rc3_ICX7',
        name: '10010_rc3_ICX7',
        category: 'REGULAR',
        createdDate: '2024-05-23T03:54:07.867+00:00'
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'REGULAR',
        createdDate: '2024-05-22T07:21:52.693+00:00'
      },
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:50.553+00:00',
        isDowngradeVersion: true
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:46.772+00:00',
        isDowngradeVersion: true
      }
    ]
  },
  {
    modelGroup: 'ICX71',
    switchCount: 1,
    versions: [
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:50.553+00:00',
        isDowngradeVersion: true
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:46.772+00:00',
        inUse: true
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

export const icx7150C08pGroupedData = [
  [
    {
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue',
      switchId: '58:fb:96:0e:87:88',
      switchName: 'FEK3230S0CZ-YC',
      isStack: true,
      model: 'ICX7150-C12P',
      currentFirmware: '10010e_b5107',
      preDownload: false,
      isSwitchLevelSchedule: false
    },
    {
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue',
      switchId: 'c0:c5:20:aa:32:79',
      switchName: 'FEK3224R0AG - Real Stack',
      isStack: true,
      model: 'ICX7150-C12P',
      currentFirmware: '09010j',
      preDownload: false,
      isSwitchLevelSchedule: false
    }
  ],
  [
    {
      venueId: '81e0fac39cee430992e9f770fce36453',
      venueName: 'My-Venue2',
      switchId: 'c0:c5:20:b2:0e:e9',
      switchName: 'ICX7150-C08P Switch - testt',
      isStack: false,
      model: 'ICX7150-C08P',
      currentFirmware: '09010j_cd3',
      preDownload: true,
      isSwitchLevelSchedule: false
    }
  ]
]

export const icx8200AvGroupedData = [
  [
    {
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue',
      switchId: 'c0:c5:20:82:52:68',
      switchName: 'FNF4349S00S',
      isStack: false,
      model: 'ICX8200_48',
      currentFirmware: '10010d_cd1_rc5',
      preDownload: false,
      isSwitchLevelSchedule: false
    }
  ],
  [
    {
      venueId: '81e0fac39cee430992e9f770fce36453',
      venueName: 'My-Venue2',
      switchId: '80:f0:cf:34:9a:a2',
      switchName: 'FPG4324V00H Switch - test',
      isStack: false,
      model: 'ICX8200_24PV',
      currentFirmware: '10010f',
      preDownload: true,
      isSwitchLevelSchedule: false
    }
  ]
]

export const icx8100XGroupedData = [
  [
    {
      venueId: '81e0fac39cee430992e9f770fce3645b',
      venueName: 'My-Venue',
      switchId: '5c:83:6c:3f:bc:70',
      switchName: 'FPR4830V018',
      isStack: false,
      model: 'ICX8100_48_X',
      currentFirmware: '10010g',
      preDownload: false,
      isSwitchLevelSchedule: false
    }
  ],
  [
    {
      venueId: '81e0fac39cee430992e9f770fce36453',
      venueName: 'My-Venue2',
      switchId: '80:f0:cf:34:9a:12',
      switchName: 'FPA4828V01P Switch - test',
      isStack: false,
      model: 'ICX8100_24',
      currentFirmware: '10010f_cd2',
      preDownload: true,
      isSwitchLevelSchedule: false
    }
  ]
]