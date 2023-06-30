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
