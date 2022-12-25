export const mockedTenantId = '6de6a5239a1441cfb9c7fde93aa613fe'

export const mockedVenueId = 'd6062edbdf57451facb33967c2160c72'

export const mockedVenueApList = [
  {
    serialNumber: '987898003011',
    apName: 'Jacky-Test-1',
    serviceId: '123',
    serviceName: 'My mDNS Proxy 1'
  },
  {
    serialNumber: '987898003022',
    apName: 'Jacky-Test-2',
    serviceId: '456',
    serviceName: 'My mDNS Proxy 2',
    rules: [
      {
        enabled: true,
        service: 'AIRDISK',
        fromVlan: 1,
        toVlan: 2
      },
      {
        enabled: true,
        service: 'AIRPLAY',
        fromVlan: 3,
        toVlan: 4
      },
      {
        enabled: true,
        service: 'AIRPORT_MANAGEMENT',
        fromVlan: 5,
        toVlan: 6
      }
    ]
  }
]

export const mockedMdnsProxyList = [
  {
    rules: [
      {
        enabled: true,
        service: 'AIRDISK',
        fromVlan: 1,
        toVlan: 2
      },
      {
        enabled: true,
        service: 'AIRPLAY',
        fromVlan: 3,
        toVlan: 4
      },
      {
        enabled: true,
        service: 'AIRPORT_MANAGEMENT',
        fromVlan: 5,
        toVlan: 6
      }
    ],
    serviceName: 'JackyBonjure2',
    id: 'cb721ac1e8084f88b6bb5d730b8cf24d'
  },
  {
    aps: [
      {
        serialNumber: '987898003011',
        venueId: '48057f171bc34bfba87ca75c28d30937'
      }
    ],
    rules: [
      {
        enabled: true,
        service: 'OTHER',
        mdnsName: 'First Rule',
        mdnsProtocol: 'TCP',
        fromVlan: 1,
        toVlan: 2
      }
    ],
    serviceName: 'Jacky-mDNS-12140613',
    id: '2a4176467b1d4f3f8cc15999a160591d'
  }
]

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
