import { FirmwareCategory, FirmwareType } from '@acx-ui/rc/utils'

export const mockedFirmwareVenuesPerApModel = {
  page: 1,
  totalCount: 4,
  data: [
    {
      id: '32127cc0605f416ab8dd070ed8c30b72',
      name: 'VenueAAA-withFirmwareSchedule',
      isFirmwareUpToDate: false,
      currentApFirmwares: [
        { apModel: 'R770', firmware: '7.0.0.103.1240' },
        { apModel: 'R750', firmware: '7.0.0.103.1240' },
        { apModel: 'R550', firmware: '7.0.0.103.1000' },
        { apModel: 'R720', firmware: '6.2.3.103.800' },
        { apModel: 'R500', firmware: '6.2.0.103.533' }
      ],
      lastScheduleUpdate: '2024-02-26T16:00:00.784-08:00',
      nextSchedules: [
        {
          startDateTime: '2024-03-04T14:00:00-08:00',
          versionInfo: {
            version: '7.0.0.104.1220',
            type: FirmwareType.AP_FIRMWARE_UPGRADE,
            category: FirmwareCategory.RECOMMENDED
          }
        },
        {
          startDateTime: '2024-03-04T14:00:00-08:00',
          versionInfo: {
            version: '6.2.0.103.554',
            type: FirmwareType.AP_FIRMWARE_UPGRADE,
            category: FirmwareCategory.RECOMMENDED
          }
        }
      ]
    },
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
    },
    {
      id: '6015f2a175e1429bad3e80f4e45287da',
      name: 'venueDDD-VenueIsNotInWifiDBOrNoAp',
      isFirmwareUpToDate: true
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

export const mockedFirmwareVersionIdList = mockedApModelFirmwares.map(fw => fw.id)
