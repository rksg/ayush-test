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
