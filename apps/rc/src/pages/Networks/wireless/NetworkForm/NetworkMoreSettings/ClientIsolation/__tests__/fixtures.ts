import { NetworkVenue, RadioEnum } from '@acx-ui/rc/utils'

export const mockedTenantId = '6de6a5239a1441cfb9c7fde93aa613fe'

export const mockedClientIsolationList = [
  {
    tenantId: mockedTenantId,
    name: 'ClientAAA',
    allowlist: [
      {
        mac: 'aa:bb:cc:dd:ee:11'
      }
    ],
    id: '18453a47a770474688a8882b2ec75aff'
  },
  {
    tenantId: mockedTenantId,
    name: 'Isolation-9',
    allowlist: [
      {
        mac: '99:88:77:66:55:44'
      }
    ],
    id: '30594d710dbf4cf98e802835700fa134'
  },
  {
    tenantId: mockedTenantId,
    name: 'Isolation-2',
    allowlist: [
      {
        mac: 'FF:88:77:AA:55:44'
      }
    ],
    id: 'z0594d710dbzzzzz8e802835700fa134'
  }
]

export const mockedVenues = {
  fields: ['country', 'city', 'aps', 'latitude', 'switches', 'description', 'networks',
    'switchClients', 'vlan', 'radios', 'name', 'scheduling', 'id', 'aggregatedApStatus',
    'mesh', 'activated', 'longitude', 'status'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '6de6a5239a1441cfb9c7fde93aa613fe',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7690084',
      longitude: '-73.9431541',
      switches: 2,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      networks: {
        count: 4,
        names: ['002', '003', 'open network test', '001'],
        vlans: [1]
      }
    },
    {
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',
      name: 'TDC_Venue',
      description: 'Taipei',
      city: 'Zhongzheng District, Taipei City',
      country: 'Taiwan',
      latitude: '25.0346703',
      longitude: '121.5218293',
      networks: { count: 1, names: ['JK-Network'], vlans: [1] },
      aggregatedApStatus: { '2_00_Operational': 1 },
      switchClients: 1,
      switches: 1,
      status: '2_Operational',
      mesh: { enabled: false }
    }
  ]
}

export const mockedNetworkVenue: NetworkVenue[] = [
  {
    allApGroupsRadio: RadioEnum.Both,
    apGroups: [],
    isAllApGroups: true,
    name: 'My-Venue',
    venueId: '6de6a5239a1441cfb9c7fde93aa613fe'
  },
  {
    allApGroupsRadio: RadioEnum.Both,
    apGroups: [],
    isAllApGroups: true,
    name: 'TDC_Venue',
    venueId: 'c6ae1e4fb6144d27886eb7693ae895c8'
  }
]
