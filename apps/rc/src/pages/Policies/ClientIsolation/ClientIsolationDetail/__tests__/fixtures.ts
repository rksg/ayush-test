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

export const mockedVenueData = {
  fields: [
    'name',
    'id',
    'addressLine'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '7bf824f4b7f949f2b64e18fb6d05b0f4',
      name: 'My-Venue',
      addressLine: '85 Main St,New York,United States'
    },
    {
      id: '770c3794b4fd4bf6bf9e64e8f14db293',
      name: 'venue1',
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
    },
    {
      id: 'ea982f159b334c489a3e424767e96c1e',
      name: 'venue2',
      addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
    }
  ]
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
      ],
      venueActivations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          apModel: 'R610',
          apSerialNumbers: ['121749001049'],
          portId: 1
        }
      ],
      apActivations: [
        {
          venueId: '770c3794b4fd4bf6bf9e64e8f14db293',
          apModel: 'R510',
          apSerialNumber: '121749001050',
          portId: 2
        }
      ]
    }
  ]
}

export const mockedClientIsolationQueryApListData = {
  fields: [
    'name',
    'serialNumber'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      serialNumber: '121749001049',
      name: 'AP-R610'
    },
    {
      serialNumber: '121749001050',
      name: 'AP-R510'
    }
  ]
}

export const mockedClientIsolationQueryWithoutActivationData = {
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
      activations: []
    }
  ]
}

export const mockedNetworkQueryData = {
  fields: [
    'name',
    'id'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'james-psk',
      id: '936ad54680ba4e5bae59ae1eb817ca24'
    },
    {
      name: 'sdafsdf',
      id: 'bd789b85931b40fe94d15028dffc6214'
    }
  ]
}