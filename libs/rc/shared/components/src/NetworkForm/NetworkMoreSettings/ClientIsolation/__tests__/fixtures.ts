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
  fields: ['name', 'id', 'dhcp.enabled'],
  totalCount: 3,
  page: 1,
  data: [
    {
      id: '6de6a5239a1441cfb9c7fde93aa613fe',
      name: 'My-Venue'
    },
    {
      id: 'c6ae1e4fb6144d27886eb7693ae895c8',
      name: 'TDC_Venue',
      dhcp: { enabled: false }
    },
    {
      id: 'xxxx1e4fb6144d27886eb7693ae8aaaa',
      name: 'DHCP_Venue',
      dhcp: { enabled: true }
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
  },
  {
    allApGroupsRadio: RadioEnum.Both,
    apGroups: [],
    isAllApGroups: true,
    name: 'DHCP_Venue',
    venueId: 'xxxx1e4fb6144d27886eb7693ae8aaaa'
  }
]
