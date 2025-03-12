/* eslint-disable max-len */
import {
  FirmwareCategory
} from '@acx-ui/rc/utils'

export const successResponse = {
  requestId: 'request-id'
}

export const availableVersionsV1002 = [
  {
    modelGroup: 'ICX82',
    switchCount: 0,
    versions: [
      {
        id: '10010_rc3',
        name: '10010_rc3',
        category: 'REGULAR',
        createdDate: '2024-05-23T03:54:07.867+00:00',
        inUse: true,
        isDowngradeVersion: true
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'REGULAR',
        createdDate: '2024-05-22T07:21:52.693+00:00',
        inUse: true,
        isDowngradeVersion: true
      },
      {
        id: '10010a_cd1_b3',
        name: '10010a_cd1_b3',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:12:47.128+00:00',
        inUse: true,
        isDowngradeVersion: true
      }
    ]
  },
  {
    modelGroup: 'ICX7X',
    switchCount: 0,
    versions: [
      {
        id: '10010_rc3',
        name: '10010_rc3',
        category: 'REGULAR',
        createdDate: '2024-05-23T03:54:07.867+00:00',
        inUse: true
      },
      {
        id: '10010_rc2',
        name: '10010_rc2',
        category: 'REGULAR',
        createdDate: '2024-05-22T07:21:52.693+00:00',
        inUse: true,
        isDowngradeVersion: true
      },
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:50.553+00:00',
        inUse: true,
        isDowngradeVersion: true,
        isDowngraded10to90: true
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:46.772+00:00',
        isDowngradeVersion: true,
        isDowngraded10to90: true
      }
    ]
  },
  {
    modelGroup: 'ICX71',
    switchCount: 2,
    versions: [
      {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:50.553+00:00',
        inUse: true,
        isDowngradeVersion: true
      },
      {
        id: '09010h_rc1',
        name: '09010h_rc1',
        category: 'REGULAR',
        createdDate: '2024-04-09T09:13:46.772+00:00',
        inUse: true,
        isDowngradeVersion: true
      },
      {
        id: '09010h_cd2_b4',
        name: '09010h_cd2_b4',
        category: 'RECOMMENDED',
        createdDate: '2024-04-09T09:13:06.337+00:00',
        inUse: true
      }
    ]
  }
]

export const versionLatest = [
  {
    name: '6.2.1.103.1580',
    category: 'RECOMMENDED',
    id: '6.2.1.103.1580',
    createdDate: '2022-12-16T06:22:23.337+0000',
    updatedDate: '2023-02-02T06:36:09.359+0000'
  }
]

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

export const venue = [
  {
    id: '0842f2133565438d85e1e46103889744',
    name: 'Peter-Venue',
    apCount: 1,
    apModels: ['R750'],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        sequence: 2,
        category: 'RECOMMENDED'
      }
    ]
  },
  {
    id: '8ee8acc996734a5dbe43777b72469857',
    name: 'Ben-Venue-US',
    apCount: 1,
    apModels: ['R610', 'R770'],
    currentVenueUnsupportedApModels: ['R770'],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        sequence: 2,
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.413',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['T300'],
        sequence: 1,
        isAbfGreaterThanVenueCurrentAbf: false
      }
    ],
    lastScheduleUpdate: '2023-02-18T01:07:33.203-08:00'
  },
  {
    id: '02b81f0e31e34921be5cf47e6dce1f3f',
    name: 'My-Venue',
    apCount: 0,
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        sequence: 2,
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.433',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['T300'],
        sequence: 1,
        isAbfGreaterThanVenueCurrentAbf: false
      },
      {
        name: 'eol-ap-2022-12',
        currentEolVersion: '6.2.0.103.533',
        latestEolVersion: '6.2.0.103.533',
        apCount: 1,
        apModels: ['R550'],
        sequence: 1,
        isAbfGreaterThanVenueCurrentAbf: false
      },
      {
        name: 'ABF2-3R',
        currentEolVersion: '6.2.3.103.200',
        latestEolVersion: '6.2.3.103.200',
        apCount: 1,
        apModels: ['H550'],
        sequence: 2,
        isAbfGreaterThanVenueCurrentAbf: true
      }
    ]
  },
  {
    id: 'aaa2f2133565438d85e1e46103889999',
    name: 'Legacy-Venue',
    apCount: 1,
    apModels: ['R512'],
    versions: [
      {
        version: '6.1.0.10.433',
        type: 'AP_FIRMWARE_UPGRADE',
        sequence: 1,
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2022-12',
        currentEolVersion: '6.2.0.103.513',
        latestEolVersion: '6.2.0.103.533',
        apCount: 1,
        apModels: ['T300'],
        sequence: 1,
        isAbfGreaterThanVenueCurrentAbf: true
      }
    ]
  },
  {
    id: 'zzz2f2133565438d85e1e46103889999',
    name: 'Latest-Venue',
    apCount: 1,
    apModels: ['R599'],
    versions: [
      {
        version: '7.0.0.103.288',
        type: 'AP_FIRMWARE_UPGRADE',
        sequence: 3,
        category: 'RECOMMENDED'
      }
    ]
  }
]

export const version = [
  '6.2.1.103.1583',
  '6.2.1.103.1582',
  '6.2.1.103.1581',
  '6.2.1.103.1580',
  '6.2.1.103.1579'
]

export const availableVersions = [{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1722',
  id: '6.2.1.103.1722'
},{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1721',
  id: '6.2.1.103.1721'
},{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1720',
  id: '6.2.1.103.1720'
},{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1719',
  id: '6.2.1.103.1719'
},{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1718',
  id: '6.2.1.103.1718'
},{
  onboardDate: '2023-02-02T06:36:55.375+0000',
  releaseDate: '2023-02-07T08:59:31.873+0000',
  category: 'RECOMMENDED' as FirmwareCategory,
  name: '6.2.1.103.1579',
  id: '6.2.1.103.1579'
}]

export const switchVenueV1002NextSchedule = [
  {
    venueId: '2840ec89e34347298b00e5ac01e85214',
    venueName: 'auto11',
    versions: [
      {
        modelGroup: 'ICX71',
        version: '09010j_cd2_rc14'
      },
      {
        modelGroup: 'ICX82',
        version: '10010b_rc88'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010j_cd2_rc14'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2024-11-13T00:00:00-05:00',
        endDateTime: '2024-11-13T02:00:00-05:00'
      },
      supportModelGroupVersions: [
        {
          modelGroup: 'ICX82',
          version: '10010f_b494'
        },
        {
          modelGroup: 'ICX7X',
          version: '10010f_b494'
        },
        {
          modelGroup: 'ICX71',
          version: '09010e_b295'
        }
      ]
    },
    preDownload: false,
    status: 'NONE',
    scheduleCount: 1
  }
]

export const switchVenueV1002 = [
  {
    venueId: '28c547b442f54d1cbec835d6e9cc2ac6',
    venueName: 'My-Venue-reg-profile',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-05-23T03:55:15.151+00:00',
    preDownload: true,
    switchCounts: [
      {
        modelGroup: 'ICX71',
        count: 1
      }
    ],
    status: 'SUCCESS',
    scheduleCount: 0
  },
  {
    venueId: 'a9387e11dd414cf08e2758bba6dd853b',
    venueName: 'My-Venue-cli-template',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_rc1'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-06-29T10:45:43.117+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: '72a44bc9039f4a20a4733e208dfb8b5a',
    venueName: 'My-Venue-cli-profile-skip',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX71',
        version: '09010f_b19'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010f_b19'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2024-07-25T00:00:00-07:00',
        endDateTime: '2024-07-25T02:00:00-07:00'
      },
      supportModelGroupVersions: [
        {
          modelGroup: 'ICX7X',
          version: '09010h_rc1'
        },
        {
          modelGroup: 'ICX71',
          version: '09010h_rc1'
        }
      ]
    },
    lastScheduleUpdateTime: '2024-07-08T08:58:13.499+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 1
  },
  {
    venueId: 'a1f2bf4f969849d5a1ecfdfdb0664fac',
    venueName: 'ccc',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010_rc3'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '10010_rc3'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-07-09T03:59:38.071+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: 'ea1afaea242d433c86c26884adad779d',
    venueName: 'Karen-Venue-2',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_rc1'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-06-29T10:45:43.155+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: '4d0a536ab6bf4838b43d99ae910a7edc',
    venueName: 'jk-test-venue',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010b_rc88'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    preDownload: false,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: '76c260d071d44f94a091338acbf182b9',
    venueName: 'My-Venue-cli-profile-2',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: 'b2e9c96e150047f5a03f99dc36a34ac8',
    venueName: 'sss',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd1_b3'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2024-05-23T02:00:00-07:00',
        endDateTime: '2024-05-23T04:00:00-07:00'
      },
      supportModelGroupVersions: [
        {
          modelGroup: 'ICX71',
          version: '09010h_rc1'
        },
        {
          modelGroup: 'ICX7X',
          version: '09010h_rc1'
        }
      ]
    },
    lastScheduleUpdateTime: '2024-07-07T10:41:37.961+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 1
  },
  {
    venueId: 'd04ece51606642cca31568238ef8f977',
    venueName: 'eeew',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX7X',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-07-02T02:38:06.961+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: 'e45b772da5504ea48af9fe472755ae22',
    venueName: 'Karen-New',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX71',
        version: '09010f_b19'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010f_b19'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-07-03T01:56:49.881+00:00',
    preDownload: true,
    status: 'NONE',
    scheduleCount: 0
  },
  {
    venueId: '188c9ed87b86428b8a21246cc1f88624',
    venueName: 'My-Venue',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010a_cd3_b11'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_rc1'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_cd2_b4'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    nextSchedule: {
      timeSlot: {
        startDateTime: '2024-07-18T04:00:00-04:00',
        endDateTime: '2024-07-18T06:00:00-04:00'
      },
      supportModelGroupVersions: [
        {
          modelGroup: 'ICX82',
          version: '10010_rc2'
        },
        {
          modelGroup: 'ICX7X',
          version: '09010h_rc1'
        },
        {
          modelGroup: 'ICX71',
          version: '09010h_cd2_b4'
        }
      ]
    },
    lastScheduleUpdateTime: '2024-06-29T10:45:43.131+00:00',
    preDownload: true,
    switchCounts: [
      {
        modelGroup: 'ICX71',
        count: 1
      }
    ],
    status: 'NONE',
    scheduleCount: 1
  },
  {
    venueId: 'f3a4a81b24ad4d7b8b2ba4d6ea402b31',
    venueName: 'longlonglonglonglonglonglongvv',
    versions: [
      {
        modelGroup: 'ICX82',
        version: '10010_rc2'
      },
      {
        modelGroup: 'ICX71',
        version: '09010h_rc1'
      },
      {
        modelGroup: 'ICX7X',
        version: '09010h_rc1'
      },
      {
        modelGroup: 'ICX81',
        version: '10010f_b467'
      }
    ],
    lastScheduleUpdateTime: '2024-07-07T11:06:32.307+00:00',
    preDownload: false,
    status: 'NONE',
    scheduleCount: 0
  }
]

export const switchLatestV1002 = [
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
  },
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
    modelGroup: 'ICX81',
    versions: [
      {
        id: '10010f_b467',
        name: '10010f_b467',
        category: 'RECOMMENDED',
        createdDate: '2024-06-13T10:28:39.950+00:00'
      }
    ]
  }
]

export const switchRelease = [
  {
    id: '09010e_b392',
    name: '09010e_b392',
    category: 'RECOMMENDED'
  },
  {
    id: '09010f_b19',
    name: '09010f_b19',
    category: 'RECOMMENDED'
  },
  {
    id: '09010f_b401',
    name: '09010f_b401',
    category: 'RECOMMENDED'
  },
  {
    id: '09010f_b403',
    name: '09010f_b403',
    category: 'RECOMMENDED'
  },
  {
    id: '10010_b176',
    name: '10010_b176',
    category: 'RECOMMENDED'
  },
  {
    id: '10010_rc2',
    name: '10010_rc2',
    category: 'RECOMMENDED'
  },
  {
    id: '10010_rc3',
    name: '10010_rc3',
    category: 'RECOMMENDED'
  },
  {
    id: '10010f_b467',
    name: '10010f_b467',
    category: 'RECOMMENDED'
  }
]

export const availableABFList = [
  {
    abf: 'active',
    sequence: 3,
    supportedApModels: ['R770', 'R550'],
    releaseDate: '2023-11-15T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-11-31T02:31:12.682+0000',
    name: '7.0.0.104.100',
    id: '7.0.0.104.100'
  },
  {
    abf: 'active',
    sequence: 3,
    supportedApModels: ['R770'],
    releaseDate: '2023-06-15T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-31T02:31:12.682+0000',
    name: '7.0.0.103.288',
    id: '7.0.0.103.288'
  },
  {
    abf: 'active',
    sequence: 3,
    supportedApModels: ['R770'],
    releaseDate: '2023-06-19T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-01T02:31:12.682+0000',
    name: '7.0.0.103.260',
    id: '7.0.0.103.260'
  },
  {
    abf: 'ABF2-3R',
    releaseDate: '2023-05-15T19:29:20.563+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-15T10:14:59.048+0000',
    name: '6.2.3.103.200',
    id: '6.2.3.103.200',
    supportedApModels: ['H550']
  },
  {
    abf: 'eol-ap-2022-12',
    sequence: 1,
    supportedApModels: [
      'R500',
      'R600',
      'R730',
      'T300',
      'T300E',
      'T301N',
      'T301S',
      'R310',
      'H320',
      'R320',
      'H510',
      'R510',
      'M510',
      'R610',
      'R710',
      'R720',
      'T310C',
      'T310D',
      'T310N',
      'T310S',
      'T610',
      'T610S',
      'T710',
      'T710S',
      'E510',
      'H350',
      'H550',
      'R350',
      'R550',
      'R650',
      'R750',
      'R850',
      'T350C',
      'T350D',
      'T350SE',
      'T750',
      'T750SE'
    ],
    releaseDate: '2023-05-05T19:29:20.563+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-05T10:14:59.048+0000',
    name: '6.2.0.103.533',
    id: '6.2.0.103.533'
  },
  {
    abf: 'eol-ap-2022-12',
    sequence: 1,
    supportedApModels: [
      'R500',
      'R600',
      'R730',
      'T300',
      'T300E',
      'T301N',
      'T301S',
      'R310',
      'H320',
      'R320',
      'H510',
      'R510',
      'M510',
      'R610',
      'R710',
      'R720',
      'T310C',
      'T310D',
      'T310N',
      'T310S',
      'T610',
      'T610S',
      'T710',
      'T710S',
      'E510',
      'H350',
      'H550',
      'R350',
      'R550',
      'R650',
      'R750',
      'R850',
      'T350C',
      'T350D',
      'T350SE',
      'T750',
      'T750SE'
    ],
    releaseDate: '2023-04-18T23:33:30.771+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-04-18T08:04:31.098+0000',
    name: '6.2.0.103.513',
    id: '6.2.0.103.513'
  },
  {
    abf: 'eol-ap-2021-05',
    releaseDate: '2023-02-10T19:03:37.166+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-02-07T09:16:58.390+0000',
    name: '6.1.0.10.453',
    id: '6.1.0.10.453',
    supportedApModels: ['T300']
  },
  {
    abf: 'eol-ap-2021-05',
    releaseDate: '2023-02-05T19:03:37.166+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-02-01T09:16:58.390+0000',
    name: '6.1.0.10.433',
    id: '6.1.0.10.433',
    supportedApModels: ['T300']
  },
  {
    abf: 'eol-ap-2021-05',
    releaseDate: '2023-02-01T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-01-31T02:31:12.682+0000',
    name: '6.1.0.10.413',
    id: '6.1.0.10.413',
    supportedApModels: ['T300']
  }
]

export const mockedFirmwareVersionIdList = availableABFList.filter(abf => abf.abf === 'active').map(abf => abf.id)

export const mockedApModelFamilies = [
  {
    name: 'AC_WAVE1',
    displayName: '11ac wave 1',
    apModels: [
      'R600',
      'R500',
      'R310',
      'R730',
      'T300',
      'T300E',
      'T301N',
      'T301S'
    ]
  },
  {
    name: 'AC_WAVE2',
    displayName: '11ac wave 2',
    apModels: [
      'R720',
      'R710',
      'R610',
      'R510',
      'R320',
      'M510',
      'H510',
      'H320',
      'E510',
      'T710',
      'T710S',
      'T610',
      'T610S',
      'T310C',
      'T310D',
      'T310N',
      'T310S'
    ]
  },
  {
    name: 'WIFI_6',
    displayName: 'Wi-Fi 6',
    apModels: [
      'R850',
      'R750',
      'R650',
      'R550',
      'R350',
      'H550',
      'H350',
      'T750',
      'T750SE',
      'T350C',
      'T350D',
      'T350SE'
    ]
  },
  {
    name: 'WIFI_6E',
    displayName: 'Wi-Fi 6e',
    apModels: [
      'R560',
      'R760'
    ]
  },
  {
    name: 'WIFI_7',
    displayName: 'Wi-Fi 7',
    apModels: [
      'R770',
      'R670',
      'T670',
      'T670SN',
      'H670'
    ]
  }
]

export const mockedFirmwareVenuesPerApModel = [
  {
    id: '90b0b0cd6c3a44a894fe73e210b1a4c1',
    name: 'venueBBB-upToDate',
    isFirmwareUpToDate: true,
    currentApFirmwares: [
      { apModel: 'R550', firmware: '7.0.0.104.1220' }
    ],
    lastScheduleUpdate: '2024-02-22T14:00:01.099-08:00'
  },
  {
    id: '10b0b0cd6c3a44a894fe73e210b12345',
    name: 'venueCCC-oneApOutdated',
    isFirmwareUpToDate: false,
    currentApFirmwares: [
      { apModel: 'R350', firmware: '7.0.0.104.1220' },
      { apModel: 'R550', firmware: '6.2.0.103.486' }
    ],
    lastScheduleUpdate: '2022-01-12T14:00:01.099-08:00'
  }
]
