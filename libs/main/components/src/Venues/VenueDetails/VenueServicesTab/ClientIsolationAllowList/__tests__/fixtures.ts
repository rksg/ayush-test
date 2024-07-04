export const mockedIsolationUsageByVenue = {
  data: [
    {
      id: '819e400b2e8c412d990bf18d1a0b1ec5',
      name: 'JC-Iaolation-List',
      clientCount: 1,
      clientMacs: [
        'AA:BB:11:22:CC:33'
      ],
      networkCount: 1,
      networkNames: [
        'test-psk'
      ]
    }
  ],
  totalCount: 1,
  totalPages: 1,
  page: 1
}

export const mockedClientIsolationQueryData = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'ebb2a23e3e9c4f1c9d4672828cc0e4bc',
      name: 'clientIsolation1',
      description: '',
      clientEntries: [
        'aa:21:92:3e:33:e0',
        'e6:e2:fd:af:54:49'
      ],
      activations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          wifiNetworkId: 'bd789b85931b40fe94d15028dffc6214'
        },
        {
          venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4',
          wifiNetworkId: '936ad54680ba4e5bae59ae1eb817ca24'
        }
      ]
    }
  ]
}
