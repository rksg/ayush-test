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

export const versionRelease = [
  {
    releaseDate: '2023-01-31T02:20:38.415+0000',
    category: 'RECOMMENDED',
    onboardDate: '2022-12-16T06:22:23.337+0000',
    name: '6.2.1.103.1580',
    id: '6.2.1.103.1580'
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
    apModels: [
      'R750'
    ],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        category: 'RECOMMENDED'
      }
    ]
  },
  {
    id: '8ee8acc996734a5dbe43777b72469857',
    name: 'Ben-Venue-US',
    apCount: 1,
    apModels: [
      'R610'
    ],
    versions: [
      {
        version: '6.2.1.103.1580',
        type: 'AP_FIRMWARE_UPGRADE',
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.413',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['T300']
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
        category: 'RECOMMENDED'
      }
    ],
    eolApFirmwares: [
      {
        name: 'eol-ap-2021-05',
        currentEolVersion: '6.1.0.10.433',
        latestEolVersion: '6.1.0.10.453',
        apCount: 1,
        apModels: ['R300', 'R500', 'R550']
      },
      {
        name: 'eol-ap-2022-12',
        currentEolVersion: '6.2.0.103.533',
        latestEolVersion: '6.2.0.103.533',
        apCount: 1,
        apModels: ['R500']
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
        }
      ],
      preDownload: false,
      upgradeVenueViewList: null
    },
    {
      id: '923f6df894c340498894a6b7c68feaae',
      name: 'My-Venue',
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
        }
      ],
      preDownload: false,
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
    id: '09010f_b401',
    name: '09010f_b401',
    category: 'RECOMMENDED'
  },
  {
    id: '09010e_b399',
    name: '09010e_b399',
    category: 'RECOMMENDED'
  },
  {
    id: '09010e_b397',
    name: '09010e_b397',
    category: 'RECOMMENDED'
  },
  {
    id: '09010f_b403',
    name: '09010f_b403',
    category: 'RECOMMENDED'
  }
]

export const switchCurrentVersions = {
  currentVersions: [
    '09010e_b392',
    '09010e_b399'
  ],
  currentVersionsAboveTen: [
    '10010_b176'
  ]
}

export const availableABFList = [
  {
    abf: 'active',
    releaseDate: '2023-06-15T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-31T02:31:12.682+0000',
    name: '7.0.0.103.288',
    id: '7.0.0.103.288'
  },
  {
    abf: 'eol-ap-2022-12',
    releaseDate: '2023-05-05T19:29:20.563+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-05-05T10:14:59.048+0000',
    name: '6.2.0.103.533',
    id: '6.2.0.103.533'
  },
  {
    abf: 'eol-ap-2022-12',
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
    id: '6.1.0.10.453'
  },
  {
    abf: 'eol-ap-2021-05',
    releaseDate: '2023-02-05T19:03:37.166+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-02-01T09:16:58.390+0000',
    name: '6.1.0.10.433',
    id: '6.1.0.10.433'
  },
  {
    abf: 'eol-ap-2021-05',
    releaseDate: '2023-02-01T18:54:43.177+0000',
    category: 'RECOMMENDED',
    onboardDate: '2023-01-31T02:31:12.682+0000',
    name: '6.1.0.10.413',
    id: '6.1.0.10.413'
  }
]
