export const mockedRogueApPoliciesList = {
  fields: [
    'id',
    'name',
    'numOfRules',
    'venueIds'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
      name: 'My Rogue AP Detection 1',
      numOfRules: 5,
      venueIds: []
    }
  ]
}

export const mockVenueRogueApResult = {
  fields: [
    'country',
    'clients',
    'city',
    'latitude',
    'switches',
    'edges',
    'description',
    'check-all',
    'networks',
    'switchClients',
    'name',
    'cog',
    'id',
    'aggregatedApStatus',
    'longitude',
    'status'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '2e7a2dd226c8422ab62316b57f5a8631',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7690084',
      longitude: '-73.9431541',
      networks: {
        count: 1,
        names: [
          'test-psk'
        ],
        vlans: [
          1
        ]
      },
      status: '1_InSetupPhase',
      aggregatedApClientHealth: []
    }
  ]
}

export const venueTable = {
  fields: [
    'country',
    'city',
    'name',
    'switches',
    'id',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '1_01_NeverContactedCloud': 10
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: '14d6ee52df3a48988f91558bac54c1ae',
        policyName: 'Default profile',
        enabled: false
      }
    },
    {
      id: '4ca20c8311024ac5956d366f15d96e03',
      name: 'test-venue2',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '2_00_Operational': 5
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: 'policyId1',
        policyName: 'Default policyId1 profile',
        enabled: true
      }
    },
    {
      id: '4ca20c5411024ac5956d366f15d96e03',
      name: 'test-venue3',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: 'policyId1',
        policyName: 'Default policyId1 profile',
        enabled: true
      }
    }
  ]
}

export const detailContent = {
  venues: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue'
    }
  ],
  name: 'Default profile',
  rules: [
    {
      name: 'SameNetworkRuleName1',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 1
    },
    {
      name: 'SameNetworkRuleName2',
      type: 'SameNetworkRule',
      classification: 'Malicious',
      priority: 2
    }
  ],
  id: 'policyId1'
}

export const policyListContent = [
  {
    id: 'policyId1',
    name: 'policyName1',
    description: '',
    numOfRules: 1,
    lastModifier: 'FisrtName 1649 LastName 1649',
    lastUpdTime: 1664790827392,
    numOfActiveVenues: 0,
    activeVenues: []
  },
  {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    name: 'test6',
    description: '',
    numOfRules: 1,
    lastModifier: 'FisrtName 1649 LastName 1649',
    lastUpdTime: 1667215711375,
    numOfActiveVenues: 0,
    activeVenues: []
  }
]
