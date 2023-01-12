import { ClientIsolationSaveData } from '@acx-ui/rc/utils'

export const mockedClientIsolation: ClientIsolationSaveData = {
  id: '1234567890',
  name: 'My first Client Isolation Policy',
  description: 'Hello Client',
  allowlist: [
    {
      mac: 'AA:BB:CC:DD:EE:11',
      ipAddress: '1.1.1.1',
      description: 'Client A'
    },
    {
      mac: 'AA:BB:CC:DD:EE:22',
      ipAddress: '1.1.1.2',
      description: 'Client B'
    },
    {
      mac: 'AA:BB:CC:DD:EE:33',
      ipAddress: '1.1.1.3',
      description: 'Client C'
    }
  ]
}

export const mockedVenuesList = {
  fields: [
    'city',
    'name',
    'id'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '421d82b69e504c578d88f805736cd209',
      name: 'JackyVenue',
      city: 'Sunnyvale, California'
    },
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'leonard-venue',
      city: 'Toronto, Ontario'
    },
    {
      id: 'd6062edbdf57451facb33967c2160c72',
      name: 'Raymond-Venue',
      city: 'New York, New York'
    }
  ]
}
