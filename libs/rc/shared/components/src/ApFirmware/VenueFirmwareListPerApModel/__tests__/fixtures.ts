import { FirmwareCategory, FirmwareType } from '@acx-ui/rc/utils'

export const mockedFirmwareVenuesPerApModel = {
  totalCount: 4,
  page: 1,
  data: [
    {
      id: '32127cc0605f416ab8dd070ed8c30b72',
      name: 'VenueAAA-withFirmwareSchedule',
      isApFirmwareUpToDate: false,
      currentApFirmwares: [
        { apModel: 'R770', firmware: '7.0.0.103.1240' },
        { apModel: 'R750', firmware: '7.0.0.103.1240' },
        { apModel: 'R350', firmware: '7.0.0.103.1240' },
        { apModel: 'R550', firmware: '7.0.0.103.1000' },
        { apModel: 'R720', firmware: '6.2.3.103.800' },
        { apModel: 'R500', firmware: '6.2.0.103.533' }
      ],
      lastApFirmwareUpdate: '2024-02-26T16:00:00.784-08:00',
      nextApFirmwareSchedules: [
        {
          startDateTime: '2024-03-04T14:00:00-08:00',
          versionInfo: {
            version: '7.0.0.104.1242',
            type: FirmwareType.AP_FIRMWARE_UPGRADE,
            category: FirmwareCategory.RECOMMENDED
          }
        }
      ]
    },
    {
      id: '90b0b0cd6c3a44a894fe73e210b1a4c1',
      name: 'venueBBB-upToDate',
      isApFirmwareUpToDate: true,
      currentApFirmwares: [
        { apModel: 'R550', firmware: '7.0.0.104.1242' }
      ],
      lastApFirmwareUpdate: '2024-02-22T14:00:01.099-08:00',
      nextApFirmwareSchedules: [
        {
          startDateTime: '2024-03-04T14:00:00-08:00',
          versionInfo: {
            version: '7.0.0.104.1242',
            type: FirmwareType.AP_FIRMWARE_UPGRADE,
            category: FirmwareCategory.RECOMMENDED
          }
        }
      ]
    },
    {
      id: '10b0b0cd6c3a44a894fe73e210b12345',
      name: 'venueCCC-oneApOutdated',
      isApFirmwareUpToDate: false,
      currentApFirmwares: [
        { apModel: 'R350', firmware: '7.0.0.104.1242' },
        { apModel: 'R550', firmware: '6.2.0.103.486' }
      ],
      lastApFirmwareUpdate: '2022-01-12T14:00:01.099-08:00'
    },
    {
      id: '6015f2a175e1429bad3e80f4e45287da',
      name: 'venueDDD-VenueIsNotInWifiDBOrNoAp',
      isApFirmwareUpToDate: true
    }
  ]
}

export const mockedApModelFirmwares = [
  {
    id: '7.0.0.104.1242',
    name: '7.0.0.104.1242',
    supportedApModels: [
      'R550', 'R770', 'R750', 'R350'
    ],
    releaseDate: '2024-02-27T07:27:53.405+00:00',
    onboardDate: '2024-02-21T05:18:57.254+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '7.0.0.104.1240',
    name: '7.0.0.104.1240',
    supportedApModels: [
      'R550', 'R770', 'R750', 'R350'
    ],
    releaseDate: '2024-02-27T07:55:30.500+00:00',
    onboardDate: '2024-02-17T09:36:43.742+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.4.103.244',
    name: '6.2.4.103.244',
    supportedApModels: [
      'R550', 'R720'
    ],
    releaseDate: '2023-12-25T07:19:26.919+00:00',
    onboardDate: '2023-12-21T03:09:32.204+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.3.103.249',
    name: '6.2.3.103.249',
    supportedApModels: [
      'R550', 'R720'
    ],
    releaseDate: '2024-02-22T06:51:52.115+00:00',
    onboardDate: '2024-02-05T08:10:35.886+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.2.103.143',
    name: '6.2.2.103.143',
    supportedApModels: [
      'R550', 'R720'
    ],
    releaseDate: '2023-11-16T09:13:48.863+00:00',
    onboardDate: '2023-07-22T05:49:47.774+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.0.103.554',
    name: '6.2.0.103.554',
    supportedApModels: [
      'R500', 'R550'
    ],
    releaseDate: '2024-02-27T07:29:28.160+00:00',
    onboardDate: '2023-11-14T10:36:14.119+0000',
    category: FirmwareCategory.RECOMMENDED
  },
  {
    id: '6.2.0.103.548',
    name: '6.2.0.103.548',
    supportedApModels: [
      'R500', 'R550'
    ],
    releaseDate: '2023-11-01T08:59:36.189+00:00',
    onboardDate: '2023-06-07T02:51:42.317+0000',
    category: FirmwareCategory.RECOMMENDED
  }
]

export const mockedEarlyAccessApModelFirmwares = [
  {
    id: '7.1.1.520.214',
    name: '7.1.1.520.214',
    supportedApModels: [
      'T670'
    ],
    onboardDate: '2024-12-19T05:10:29.596+0000',
    category: 'RECOMMENDED',
    labels: [
      'alpha'
    ]
  },
  {
    id: '7.1.1.520.209',
    name: '7.1.1.520.209',
    supportedApModels: [
      'T670'
    ],
    releaseDate: '2024-12-24T09:22:02.797+00:00',
    onboardDate: '2024-12-17T01:28:13.599+0000',
    category: 'RECOMMENDED',
    labels: [
      'legacyAlpha',
      'ga'
    ]
  },
  {
    id: '7.1.1.520.192',
    name: '7.1.1.520.192',
    supportedApModels: [
      'T670'
    ],
    releaseDate: '2024-12-23T06:12:41.585+00:00',
    onboardDate: '2024-12-11T06:20:21.706+0000',
    category: 'RECOMMENDED',
    labels: [
      'legacyAlpha'
    ]
  },
  {
    id: '7.1.1.400.18',
    name: '7.1.1.400.18',
    supportedApModels: [
      'T670'
    ],
    onboardDate: '2024-10-08T11:26:23.832+0000',
    category: 'RECOMMENDED',
    labels: [
      'beta'
    ]
  },
  {
    id: '7.0.0.300.6497',
    name: '7.0.0.300.6497',
    supportedApModels: [
      'T670'
    ],
    releaseDate: '2024-12-18T08:30:58.174+00:00',
    onboardDate: '2024-10-25T11:49:14.198+0000',
    category: 'RECOMMENDED',
    labels: [
      'ga'
    ]
  },
  {
    id: '6.2.3.103.233',
    name: '6.2.3.103.233',
    supportedApModels: [],
    releaseDate: '2023-12-27T02:17:04.068+00:00',
    onboardDate: '2023-10-19T04:17:28.082+0000',
    category: 'RECOMMENDED',
    labels: [
      'ga'
    ]
  },
  {
    id: '6.2.0.103.552',
    name: '6.2.0.103.552',
    supportedApModels: [],
    releaseDate: '2023-12-27T02:17:04.076+00:00',
    onboardDate: '2023-08-25T04:42:47.258+0000',
    category: 'RECOMMENDED',
    labels: [
      'ga'
    ]
  }
]

export const mockedFirmwareVersionIdList = mockedApModelFirmwares.map(fw => fw.id)

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
