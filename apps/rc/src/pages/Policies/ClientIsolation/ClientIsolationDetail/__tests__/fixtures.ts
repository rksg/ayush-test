import { ClientIsolationSaveData } from '@acx-ui/rc/utils'

export const mockedClientIsolation: ClientIsolationSaveData = {
  id: '1234567890',
  name: 'My first Client Isolation Policy',
  description: 'Hello Client',
  allowlist: [
    {
      mac: 'AA:BB:CC:DD:EE:11',
      description: 'Client A'
    },
    {
      mac: 'AA:BB:CC:DD:EE:22',
      description: 'Client B'
    },
    {
      mac: 'AA:BB:CC:DD:EE:33',
      description: 'Client C'
    }
  ]
}

export const mockedVenueUsage = {
  data: [
    {
      venueId: '59fed8289000458587feeb7005695a7f',
      venueName: 'v1',
      address: 'a1',
      networkCount: 2,
      networkNames: [
        'v1_open',
        'v1_psk'
      ]
    },
    {
      venueId: '446f332da48641c1879e1a46ed45039e',
      venueName: 'v2',
      address: 'a2',
      networkCount: 1,
      networkNames: [
        'v2_open'
      ]
    }
  ],
  totalCount: 2,
  totalPages: 1,
  page: 1
}
