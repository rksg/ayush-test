import { MdnsProxyFormData, MdnsProxyForwardingRule, MdnsProxyForwardingRuleTypeEnum, MdnsProxyScopeData } from '@acx-ui/rc/utils'

export const mockedTenantId = '6de6a5239a1441cfb9c7fde93aa613fe'

export const mockedForwardingRules: MdnsProxyForwardingRule[] = [
  {
    id: '__UUID__rule1',
    type: MdnsProxyForwardingRuleTypeEnum.AIRPLAY,
    fromVlan: 10,
    toVlan: 20
  },
  {
    id: '__UUID__rule2',
    type: MdnsProxyForwardingRuleTypeEnum.AIRDISK,
    fromVlan: 21,
    toVlan: 30
  }
]

export const mockedScope: MdnsProxyScopeData[] = [
  {
    venueId: '4ca20c8311024ac5956d366f15d96e0c',
    venueName: 'Venue 1',
    aps: [
      {
        serialNumber: '900000005500',
        name: 'Venue 1 - AP 1'
      },
      {
        serialNumber: '900000005501',
        name: 'Venue 1 - AP 2'
      }
    ]
  },
  {
    venueId: 'd6062edbdf57451facb33967c2160c72',
    venueName: 'Venue 2',
    aps: [
      {
        serialNumber: '121749001049',
        name: 'Venue 2 - AP 1'
      }
    ]
  }
]

export const mockedVenueList = {
  fields: [
    'city',
    'name',
    'cog',
    'id',
    'check-all'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'Venue 1',
      city: 'Toronto, Ontario'
    },
    {
      id: 'd6062edbdf57451facb33967c2160c72',
      name: 'Venue 2',
      city: 'New York, New York'
    }
  ]
}

export const multipleMockedVenueListP1 = {
  fields: [
    'city',
    'name',
    'cog',
    'id',
    'check-all'
  ],
  totalCount: 12,
  page: 1,
  data: [
    {
      id: 'e0788dea6307472d98795300fcda1119',
      name: 'bdcPerformanceVenue2',
      city: 'Sunnyvale, California'
    },
    {
      id: '0043fb3a623e4ec69ea521558d9f501d',
      name: 'govind',
      city: 'Sunnyvale, California'
    },
    {
      id: 'b6fec00830ee48d2bb1c04fc1a21b449',
      name: 'JackyVenue',
      city: 'Sunnyvale, California'
    },
    {
      id: '8fbf04c654cb46f397a0315f998d430f',
      name: 'leonard-venue',
      city: 'New York, New York'
    },
    {
      id: '89fc1ab5825a45c9ab577d630be4d357',
      name: 'leonard-venue2',
      city: 'Medina, Ohio'
    },
    {
      id: 'ed02a2c4088b4452b3bfcbc4da8ddea6',
      name: 'Mi-Venue',
      city: 'Washington Square S, New York'
    },
    {
      id: '4afc1129854e455f9ab4b035358b620b',
      name: 'Mi-Venue2',
      city: 'Sunnyvale, California'
    },
    {
      id: 'd99d955c99e6487e8671b76b115de97b',
      name: 'My-Venue',
      city: 'New York'
    },
    {
      id: 'b4396bf37eb74a8f839564db55497027',
      name: 'Raymond-Venue',
      city: 'New York, New York'
    },
    {
      id: 'd8cfd74b91fd4fddb550983e7555e28f',
      name: 'RPv2-Venue',
      city: 'Neihu District, Taipei City'
    }
  ]
}

export const multipleMockedVenueListP2 = {
  fields: [
    'city',
    'name',
    'cog',
    'id',
    'check-all'
  ],
  totalCount: 12,
  page: 2,
  data: [
    {
      id: '390e9a5026944c8180e8463c8636274b',
      name: 'rsyslog_r760',
      city: 'Sunnyvale, California'
    },
    {
      id: '9c8c65cdcfd5408aad76afe40fc8c615',
      name: 'rsyslog_venue',
      city: 'Sunnyvale, California'
    }
  ]
}

export const mockedApList = {
  fields: [
    'venueName',
    'clients',
    'serialNumber',
    'venueId',
    'name',
    'model',
    'apMac'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '121749001049',
      name: 'AP-R610',
      model: 'R610',
      venueId: 'd6062edbdf57451facb33967c2160c72',
      venueName: 'Venue 2',
      apMac: 'D8:38:FC:36:76:F0',
      clients: 5
    },
    {
      serialNumber: '121749001050',
      name: 'AP-R510',
      model: 'R510',
      venueId: 'd6062edbdf57451facb33967c2160c72',
      venueName: 'Venue 2',
      apMac: 'D8:38:FC:36:76:F1'
    }
  ]
}

export const mockedFormData: MdnsProxyFormData = {
  name: 'mDNS Proxy 123',
  forwardingRules: mockedForwardingRules,
  scope: mockedScope
}
