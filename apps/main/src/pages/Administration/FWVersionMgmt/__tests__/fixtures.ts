/* eslint-disable max-len */
import {
  FirmwareCategory
} from '@acx-ui/rc/utils'

export const successResponse = {
  requestId: 'request-id'
}

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

export const switchVenue = {
  upgradeVenueViewList: [
    {
      id: '011bf74d090b45dfb94fe9b0991e3c32',
      name: 'v2',
      switchFirmwareVersion: {
        id: '09010e_b392',
        name: '09010e_b392',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010_b176',
        name: '10010_b176',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010f_b401',
          name: '09010f_b401',
          category: 'RECOMMENDED'
        },
        {
          id: '09010f_b19',
          name: '09010f_b19',
          category: 'RECOMMENDED'
        },
        {
          id: '09010f_b403',
          name: '09010f_b403',
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
        }
      ],
      nextSchedule: {
        timeSlot: {
          startDateTime: '2023-07-11T08:00:00-07:00',
          endDateTime: '2023-07-11T10:00:00-07:00'
        },
        version: {
          id: '09010f_b401',
          name: '09010f_b401',
          category: 'RECOMMENDED'
        },
        versionAboveTen: {
          id: '10010_rc2',
          name: '10010_rc2',
          category: 'RECOMMENDED'
        }
      },
      preDownload: false,
      switchCount: 2,
      aboveTenSwitchCount: 3,
      upgradeVenueViewList: null
    },
    {
      id: '923f6df894c340498894a6b7c68feaae',
      name: 'My-Venue',
      switchFirmwareVersion: {
        id: '09010f_b19',
        name: '09010f_b19',
        category: 'RECOMMENDED'
      },
      switchFirmwareVersionAboveTen: {
        id: '10010_b176',
        name: '10010_b176',
        category: 'RECOMMENDED'
      },
      availableVersions: [
        {
          id: '09010f_b401',
          name: '09010f_b401',
          category: 'RECOMMENDED'
        },
        {
          id: '09010e_b392',
          name: '09010e_b392',
          category: 'RECOMMENDED'
        },
        {
          id: '09010f_b403',
          name: '09010f_b403',
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
        }
      ],
      preDownload: false,
      switchCount: 1,
      aboveTenSwitchCount: 1,
      upgradeVenueViewList: null
    }
  ]
}

export const switchLatest = [
  {
    id: '09010f_b401',
    name: '09010f_b401',
    category: 'RECOMMENDED',
    createdDate: '2023-02-14T20:24:24.604+00:00'
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
