import {
  EdgeDHCPFixtures,
  EdgeGeneralFixtures,
  EdgePinFixtures,
  EdgeTunnelProfileFixtures,
  NewTablePageable,
  VenueFixtures
} from '@acx-ui/rc/utils'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

const personaPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

export const mockEdgeData = {
  fields: [
    'name', 'serialNumber'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'Smart Edge 1',
      serialNumber: '0000000001'
    },
    {
      name: 'Smart Edge 2',
      serialNumber: '0000000002'
    },
    {
      name: 'Smart Edge 3',
      serialNumber: '0000000003'
    }
  ]
}

export const mockVenueNetworkData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: '1', name: 'Network 1' , venues: {
      count: 1,
      names: [
        null
      ],
      ids: [
        'testVenueId1'
      ]
    } },
    { id: '2', name: 'Network 2' , venues: {
      count: 0,
      names: [],
      ids: []
    } },
    { id: '3', name: 'Network 3' , venues: {
      count: 0,
      names: [],
      ids: []
    } }
  ]
}

export const webAuthList = [{
  id: '723250a97f3a4c3780e70c83c5b095ba',
  name: 'Template-Ken-0209',
  webAuthPasswordLabel: 'password-Ken-0209',
  webAuthCustomTitle: 'title-Ken-0209',
  webAuthCustomTop: 'top-Ken-0209',
  webAuthCustomLoginButton: 'login-Ken-0209',
  webAuthCustomBottom: 'bottom-Ken-0209'
}]

export const switchPortList = [{
  portIdentifier: '1/1/1',
  lagId: '0'
}, {
  portIdentifier: '1/1/2',
  lagId: '0'
}, {
  portIdentifier: '1/1/3',
  lagId: '1'
}]

export const switchLagList = [
  {
    id: 'b343a5a0f88d4a878a070aadc5363538',
    lagId: 1,
    name: 'test-lag',
    ports: ['1/1/3'],
    realRemove: true,
    switchId: 'c0:c5:20:aa:35:fd',
    taggedVlans: [ '2', '3'],
    type: 'static',
    untaggedVlan: '1'
  }
]

export const switchVlanUnion = {
  switchDefaultVlan: [
    {
      switchId: 'c0:c5:20:aa:35:fd',
      vlanConfigName: 'DEFAULT-VLAN',
      profileLevel: false,
      defaultVlan: true,
      vlanId: 1
    }
  ],
  switchVlan: [
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 2
    },
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 3
    },
    {
      switchId: 'c0:c5:20:aa:35:fd',
      profileLevel: false,
      defaultVlan: false,
      vlanId: 4
    }
  ]
}

export const mockApList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'mock-ap',
      apMac: '18:7C:0B:10:29:50',
      serialNumber: '125488555569',
      venueId: 'mock_venue_1',
      model: 'R510',
      apStatusData: { lanPortStatus: [{ port: '0' }, { port: '1' }, { port: '2' }] }
    },
    {
      name: 'mock-ap2',
      apMac: '18:7C:0B:10:29:51',
      serialNumber: '150000000761',
      venueId: 'mock_venue_1',
      model: 'R760',
      apStatusData: { lanPortStatus: [{ port: '0' }] }
    }
  ]
}

export const mockPersonaList = {
  pageable: personaPageable,
  sort: personaPageable.sort,
  totalPages: 1,
  totalElements: 3,
  content: [
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3000,
      devices: null,
      deviceCount: 0,
      ethernetPorts: [],
      switches: null,
      primary: true
    },
    {
      id: '1e7f81ab-9bb7-4db7-ae20-315743f83183',
      groupId: 'e5247c1c-630a-46f1-a715-1974e49ec867',
      parentId: null,
      description: null,
      name: 'mock-persona2',
      email: null,
      tenantId: 'c626f130cb31431d93c10cb2cc02c40b',
      dpskGuid: '2fb6dee3cfdb4b9aba61bbb5f5f4ba47',
      dpskPassphrase: 'sim-tool12345683',
      identityId: null,
      revoked: false,
      vlan: null,
      vni: 3001,
      devices: ['AP-1'],
      deviceCount: 1,
      ethernetPorts: [],
      switches: null,
      primary: true
    }
  ]

}

export const mockAvailablePropertyConfigs = {
  content: [
    {
      venueId: 'mock_venue_1',
      venueName: 'Mock Venue 1',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '1dcb4608-af74-46f8-80e8-962f642062d6',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    },
    {
      venueId: 'mock_venue_2',
      venueName: 'Mock Venue 2',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '2c3ef9fe-7e35-4c42-8574-489e07835499',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    },
    {
      venueId: 'mock_venue_3',
      venueName: 'Mock Venue 3',
      address: {
        country: 'United States',
        city: 'Sunnyvale, California',
        addressLine: '350 W Java Dr, Sunnyvale, CA 94089, USA'
      },
      personaGroupId: '2c3ef9fe-7e35-4c42-8574-489e07835499',
      residentPortalId: 'a239e939-44f5-4be3-bf80-951ceaf86ecd',
      status: 'ENABLED'
    }
  ],
  pageable: {
    sort: {
      unsorted: true,
      sorted: false,
      empty: true
    },
    pageNumber: 0,
    pageSize: 20,
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: true,
  totalPages: 1,
  totalElements: 12,
  first: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: true
  },
  numberOfElements: 12,
  size: 20,
  number: 0,
  empty: false
}

export const mockedNetworkOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'networkId1',
      name: 'network1'
    },
    {
      id: 'networkId2',
      name: 'network2'
    }
  ]
}

export const mockedSwitchOptions = {
  totalCount: 2,
  page: 1,
  data: [
    {
      switchMac: 'c0:c5:20:78:df:32',
      name: 'network1'
    },
    {
      switchMac: 'c0:c5:20:78:df:31',
      name: 'network2'
    }
  ]
}

const { mockVenueOptions } = VenueFixtures
const {
  mockPropertyConfigs,
  mockPersonaGroup,
  mockDpsk,
  mockPinSwitchInfoData,
  mockDeepNetworkList
} = EdgePinFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures
const { mockDhcpStatsData } = EdgeDHCPFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

export const mockContextData = {
  setVenueId: jest.fn(),
  venueOptions: mockVenueOptions.data.map(item => ({ label: item.name, value: item.id })),
  isVenueOptionsLoading: false,
  personaGroupId: mockPropertyConfigs.personaGroupId,
  isGetPropertyConfigError: false,
  isPropertyConfigLoading: false,
  personaGroupData: mockPersonaGroup,
  isPersonaGroupLoading: false,
  dpskData: mockDpsk,
  isDpskLoading: false,
  // eslint-disable-next-line max-len
  clusterOptions: mockEdgeClusterList.data.map(item => ({ label: item.name, value: item.clusterId })),
  isClusterOptionsLoading: false,
  dhcpList: mockDhcpStatsData.data,
  dhcpOptions: mockDhcpStatsData.data.map(item =>
    ({ label: item.serviceName, value: item.id })),
  isDhcpOptionsLoading: false,
  tunnelProfileOptions: mockedTunnelProfileViewData.data.map(item =>
    ({ label: item.name, value: item.id })),
  isTunnelLoading: false,
  networkOptions: mockDeepNetworkList.response.map(item =>({ label: item.name, value: item.id })),
  isNetworkOptionsLoading: false,
  switchList: [
    ...mockPinSwitchInfoData.distributionSwitches,
    ...mockPinSwitchInfoData.accessSwitches
  ],
  refetchSwitchesQuery: jest.fn(),
  getVenueName: jest.fn(),
  getClusterName: jest.fn(),
  getDhcpName: jest.fn(),
  getTunnelProfileName: jest.fn(),
  getNetworksName: jest.fn(),
  requiredFw_DS: '10.0.10f',
  requiredFw_AS: '10.0.10f',
  requiredSwitchModels: ['ICX7650', 'ICX7850', 'ICX7550'],
  addNetworkCallback: jest.fn(),
  getClusterInfoByTunnelProfileId: jest.fn(),
  availableTunnelProfiles: mockedTunnelProfileViewData.data,
  getClusterInfoByClusterId: jest.fn()
}

export const mockSwitchFeatureSet = {
  totalCount: 2,
  page: 1,
  featureSets: [
    {
      featureName: 'PIN_AS',
      featureGroup: 'PIN',
      featureType: 'SWITCH',
      featureLevel: 'VENUE',
      requirements: [
        {
          firmware: '10.0.10f'
        }
      ]
    },
    {
      featureName: 'PIN_DS',
      featureGroup: 'PIN',
      featureType: 'SWITCH',
      featureLevel: 'VENUE',
      requirements: [
        {
          firmware: '10.0.10f',
          models: [
            'ICX7650',
            'ICX7850',
            'ICX7550'
          ]
        }
      ]
    }
  ]
}

export const edgeClusterConfigValidationFailed = {
  requestId: '3fb4f398-e3cf-4516-914a-35706431e5cd',
  errors: [
    {
      code: 'PERSONAL-IDENTITY-NETWORK-10004',
      // eslint-disable-next-line max-len
      message: 'DHCP pool[x-eb24-4b66-b141-7e5e8c827229] not found, please check DHCP pool settings.',
      service: 'edge-api',
      entityType: 'pinService'
    }
  ]
}