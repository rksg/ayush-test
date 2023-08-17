import { ExpirationType } from '@acx-ui/rc/utils'

export const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12',
      mappedPolicyCount: 2
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2',
      mappedPolicyCount: 0
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4',
      mappedPolicyCount: 0
    }
  ]
}

export const macList = {
  content: [
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
      name: 'Registration pool-1',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 5,
      policySetId: 'policySet',
      associationIds: [],
      networkIds: ['a22e0192e090459ab04cdc161bf6285f']
    },
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc67',
      name: 'Registration pool-2',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: true,
      expirationDate: '2022-11-02T06:59:59Z',
      registrationCount: 6,
      expirationType: ExpirationType.SPECIFIED_DATE
    },
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc69',
      name: 'Registration pool-3',
      description: '',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: true,
      expirationType: ExpirationType.DAYS_AFTER_TIME,
      expirationOffset: 5,
      registrationCount: 6
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 3,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 3,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

export const adaptivePolicyList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 2
  },
  content: [
    {
      id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      name: 'ap1',
      description: 'for test',
      policyType: 'RADIUS',
      onMatchResponse: 'test'
    },
    {
      id: '6dc81c95-3687-4352-b25b-aa5b583e5e23',
      name: 'ap2',
      description: 'for test',
      policyType: 'RADIUS',
      onMatchResponse: 'test'
    }
  ]
}

export const prioritizedPolicies = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      policyId: '346314c9-a3ce-40dd-ab5a-7b99002bd736',
      priority: 0
    },
    {
      policyId: 'c956f012-67e5-4c46-9ded-2a35b4aa9f36',
      priority: 1
    },
    {
      policyId: 'a15323aa-2b45-403f-8d2d-20d41c9e8002',
      priority: 2
    }
  ]
}

