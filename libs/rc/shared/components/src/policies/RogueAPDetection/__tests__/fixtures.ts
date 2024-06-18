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
    },
    {
      id: 'cc080e33-26a7-4d34-870f-b7f312fcfccc',
      name: 'Default profile',
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

export const mockedRogueApPoliciesListRbac = {
  fields: [
    'numOfRules',
    'venueCount',
    'name',
    'description',
    'rule',
    'rules',
    'id',
    'venueIds'
  ],
  totalCount: 18,
  page: 1,
  data: [
    {
      id: '6015cbb1000f419bb08a04bc6c8fe70c',
      name: 'a123',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: '4eaaf341d6c34a41a80d7fd34a152126',
      name: 'adhoc-10',
      description: '',
      numOfRules: 1,
      venueIds: [
        '42cccf1501114082bd92c8e1cbfae7e4',
        '78bda4899092461998c0be6a3a325936'
      ]
    },
    {
      id: '6469bf4cc802473c897f5382cc4064eb',
      name: 'adhoc-22',
      description: '',
      numOfRules: 1,
      venueIds: [
        '779baea7db65468caa49122d146105b8'
      ]
    },
    {
      id: 'c7a0b3746503419a83237fcbe8680792',
      name: 'Default profile',
      description: '',
      numOfRules: 10,
      venueIds: []
    },
    {
      id: 'be2a109f7e784f19a9a3ea1cccc20716',
      name: 'rog-3-123',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: 'c51ce82bf53e492ab25c50625d474bd1',
      name: 'rog-3-2',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: '4c2b2deafe8940e18861b840ca3cdf32',
      name: 'rog-3-3',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: '0390734c4ba24d3c946415b20e403411',
      name: 'rog-4',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: '763808453c7b45ffa350aef872625a90',
      name: 'rog-5',
      description: '',
      numOfRules: 1,
      venueIds: []
    },
    {
      id: 'e0ba485c21624f28a5d62f282c267c27',
      name: 'rog-6',
      description: '',
      numOfRules: 1,
      venueIds: []
    }
  ]
}

export const mockedRogueApPolicyRbac = {
  id: '4eaaf341d6c34a41a80d7fd34a152126',
  name: 'adhoc-10',
  description: 'test description',
  rules: [
    {
      name: '123123',
      type: 'AdhocRule',
      classification: 'Malicious',
      priority: 1
    }
  ]
}
