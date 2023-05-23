import { ExpirationType } from '@acx-ui/rc/utils'

export const adaptivePolicy = {
  id: 'e4fc0210-a491-460c-bd74-549a9334325a',
  name: 'ps12',
  description: 'ps12'
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

export const dpskList = {
  content: [
    {
      id: 'b282cf8c66974cb2993951eebb102468',
      name: 'A1_DPSK_AccessPolicySet',
      passphraseFormat: 'MOST_SECURED',
      passphraseLength: 18,
      policyDefaultAccess: true,
      networkIds: [],
      deviceCountLimit: null,
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      expirationType: 'SPECIFIED_DATE',
      expirationOffset: null,
      expirationDate: '2023-04-25T16:00:00.000+0000',
      identityId: 'f38d41a3-38f6-4b1a-9e6f-45a9406c1d1f',
      creationDate: null,
      lastUpdationDate: '2023-04-24T02:21:49.089572'
    },
    {
      id: '3d147f56d8244ce7a9afac1f8006257c',
      name: 'A1_Jacky_After_1H',
      passphraseFormat: 'MOST_SECURED',
      passphraseLength: 18,
      policyDefaultAccess: true,
      networkIds: [],
      deviceCountLimit: null,
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      expirationType: 'HOURS_AFTER_TIME',
      expirationOffset: 1,
      expirationDate: null,
      identityId: '71e81ca6-8716-43a2-aee3-7fe14582cf90',
      creationDate: null,
      lastUpdationDate: '2023-04-06T04:02:58.878669'
    },
    {
      id: '37cc4b43315e4782a4bd89004f845ff4',
      name: 'A1_JackyHQ_DPSK_',
      passphraseFormat: 'MOST_SECURED',
      passphraseLength: 18,
      policyDefaultAccess: true,
      networkIds: [],
      deviceCountLimit: null,
      policySetId: null,
      expirationType: 'SPECIFIED_DATE',
      expirationOffset: null,
      expirationDate: '2023-04-07T07:00:00.000+0000',
      identityId: null,
      creationDate: null,
      lastUpdationDate: '2023-04-07T02:53:10.208301'
    }
  ],
  pageable: {
    sort: { sorted: true, unsorted: false, empty: false },
    pageNumber: 0,
    pageSize: 1000,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 31,
  last: true,
  first: true,
  sort: { sorted: true, unsorted: false, empty: false },
  numberOfElements: 31,
  size: 1000,
  number: 0,
  empty: false
}

export const networkList = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: '01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: '02',
      venues: { count: 0, names: [] },
      vlan: 1
    }
  ]
}

export const macList = {
  content: [
    {
      id: '373377b0cb6e46ea8982b1c80aabe1fa1',
      autoCleanup: true,
      description: '',
      enabled: true,
      expirationEnabled: true,
      name: 'Registration pool',
      expirationType: ExpirationType.SPECIFIED_DATE,
      expirationDate: '2050-11-02T06:59:59Z',
      defaultAccess: 'REJECT',
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa'
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
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

