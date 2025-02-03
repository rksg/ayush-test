import { ExpirationType } from '@acx-ui/rc/utils'

export const adaptivePolicy = {
  id: 'abb1a52d-fd77-434c-8895-36ee9a432ad1',
  name: '1010',
  description: '1010',
  mappedPolicyCount: 1,
  assignmentCount: 7,
  policyNames: [
    'policy1'
  ],
  externalAssignments: [
    {
      identityName: 'IdentityGroup',
      identityId: [
        '1cc0f58c-8ad8-404c-acf1-8c0bd0521372',
        '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
        'cd79e3cb-51ea-4f88-a405-8d2b622fc573'
      ],
      links: []
    },
    {
      identityName: 'asfasdfasdf',
      identityId: [
        'fb89f5320870417494b443e4eeabb51d'
      ],
      links: []
    },
    {
      identityName: 'JackyTest',
      identityId: [
        '4772bb0632684d28b634eac9d57e2902'
      ],
      links: []
    },
    {
      identityName: 'CertTemplate',
      identityId: [
        '74466752b9ba48ddb9d2136fed8a1d4b'
      ],
      links: []
    },
    {
      identityName: 'template_022',
      identityId: [
        'eabc9db1eff948eeb902a22860213a42'
      ],
      links: []
    }
  ],
  links: [
    {
      rel: 'self',
      href: 'https://api.dev.ruckus.cloud/policySets/abb1a52d-fd77-434c-8895-36ee9a432ad1'
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
      lastUpdationDate: '2023-04-24T02:21:49.089572',
      networkCount: 13
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
      policySetId: 'abb1a52d-fd77-434c-8895-36ee9a432ad1',
      networkCount: 15
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

export const identityGroupList = {
  content: [
    {
      id: '86a51b7d-1e15-4ad0-8d4a-504e08b845a2',
      name: 'Amazing',
      description: null,
      dpskPoolId: null,
      macRegistrationPoolId: '8cd4f603-0248-45cd-a930-d77683eccdf4',
      propertyId: null,
      createdAt: '2024-11-27T07:23:44.522187Z',
      updatedAt: '2024-11-27T07:23:45.799036Z',
      certificateTemplateId: null,
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/86a51b7d-1e15-4ad0-8d4a-504e08b845a2'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 0,
      networkCount: 14
    },
    {
      id: '7b0ba4a9-1694-4671-9d5a-e3a9ac204995',
      name: 'aoaoao',
      description: null,
      dpskPoolId: 'a7e20ba6c24c42f983417e70d5a43d57',
      macRegistrationPoolId: '8cd4f603-0248-45cd-a930-d77683eccdf4',
      propertyId: null,
      createdAt: '2024-09-10T08:30:12.286866Z',
      updatedAt: '2024-11-27T07:03:37.564521Z',
      certificateTemplateId: '312d108142c04bf486443f4af55c9b01',
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/7b0ba4a9-1694-4671-9d5a-e3a9ac204995'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 10
    },
    {
      id: 'ca958775-2bc1-43fc-a527-f2df35a8a21d',
      name: 'Bind',
      description: null,
      dpskPoolId: '9022887304f0467796da824bf57713d2',
      macRegistrationPoolId: 'edf987f4-ba58-42c8-965b-a2cca3d93dd6',
      propertyId: null,
      createdAt: '2024-07-15T07:59:55.437593Z',
      updatedAt: '2024-11-27T06:28:31.21887Z',
      certificateTemplateId: '139c56375f224b46b942f92077fe0327',
      policySetId: null,
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/ca958775-2bc1-43fc-a527-f2df35a8a21d'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 0
    }
  ],
  pageable: {
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    pageNumber: 0,
    pageSize: 2000,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  last: true,
  totalElements: 3,
  size: 2000,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  first: true,
  numberOfElements: 3,
  empty: false
}

export const certificateTemplateList = {
  fields: null,
  totalCount: 20,
  totalPages: 4,
  page: 1,
  data: [
    {
      id: 'e3adfb831d3f4e259617ebfa8b9eb0a1',
      description: null,
      name: '123123',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      onboard: {
        commonNamePattern: '123123',
        emailPattern: '',
        notAfterType: 'YEARS',
        notAfterValue: 1,
        notBeforeType: 'MONTHS',
        notBeforeValue: 1,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: '',
        organizationUnitPattern: '',
        localityPattern: '',
        statePattern: '',
        countryPattern: '',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: '98f4c70161bf40349516d7e50fa1ace1',
        certificateAuthorityName: 'rickTestRootCa'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: '123123',
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        enabled: true,
        type: 'service_account',
        projectId: 'test',
        privateKeyId: 'a0f9127e0cb0241472b02cd0ac0299246696fb40',
        privateKey: '123',
        clientEmail: 'test-9@crucial-garden-230004.iam.gserviceaccount.com',
        clientId: '123',
        authUri: '123',
        tokenUri: '123'
      },
      enabled: true,
      keyLength: 2048,
      algorithm: 'SHA_256',
      certificateCount: 6,
      certificateNames: [
        '123123',
        '123123',
        '123123',
        '123123',
        '123123',
        '123123'
      ],
      variables: [],
      networkIds: [],
      networkCount: 12
    },
    {
      id: '5d3639a8352744a0b01080cf0bd0613a',
      description: 'test',
      name: 'activity-template-test',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: '373377b0cb6e46ea8982b1c80aabe1fa',
      onboard: {
        commonNamePattern: 'santosh.poddar@commscope.com',
        emailPattern: null,
        notAfterType: 'DAYS',
        notAfterValue: 2,
        notBeforeType: 'DAYS',
        notBeforeValue: 1,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: 'test',
        organizationUnitPattern: 'Test',
        localityPattern: 'test',
        statePattern: 'test',
        countryPattern: 'CN',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: 'fa31c5aaa4324b95a4deb323ebab33e3',
        certificateAuthorityName: 's'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        accountCredential: null,
        enabled: false,
        type: null,
        projectId: null,
        privateKeyId: null,
        privateKey: null,
        clientEmail: null,
        clientId: null,
        authUri: null,
        tokenUri: null
      },
      enabled: true,
      keyLength: 2048,
      algorithm: 'SHA_256',
      certificateCount: 1,
      certificateNames: [
        'santosh.poddar@commscope.com'
      ],
      variables: [],
      networkIds: []
    },
    {
      id: 'a857a237e3b5430a911b412bc150896d',
      description: null,
      name: '${asdf@}@test.com',
      caType: 'ONBOARD',
      defaultAccess: false,
      policySetId: null,
      onboard: {
        commonNamePattern: '${asdf@}@test.com',
        emailPattern: '',
        notAfterType: 'YEARS',
        notAfterValue: 1,
        notBeforeType: 'MONTHS',
        notBeforeValue: 1,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: '',
        organizationUnitPattern: '',
        localityPattern: '',
        statePattern: '',
        countryPattern: '',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: '430f2d8562d34e5c9ba0b0a836cfc40c',
        certificateAuthorityName: 'rick-root-ca'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: null,
        accountCredential: null,
        enabled: false,
        type: null,
        projectId: null,
        privateKeyId: null,
        privateKey: null,
        clientEmail: null,
        clientId: null,
        authUri: null,
        tokenUri: null
      },
      enabled: true,
      keyLength: 2048,
      algorithm: 'SHA_256',
      certificateCount: 2,
      certificateNames: [
        '${asdf@}@test.com',
        '${asdf@}@test.com'
      ],
      variables: [],
      networkIds: []
    },
    {
      id: '1c56b1211d5447f19b326935d56ecbf0',
      description: null,
      name: 'Cert135551',
      caType: 'ONBOARD',
      defaultAccess: false,
      policySetId: null,
      onboard: {
        commonNamePattern: '',
        emailPattern: '',
        notAfterType: 'END_OF_YEAR',
        notAfterValue: 2,
        notBeforeType: 'END_OF_HOUR',
        notBeforeValue: 3,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: '',
        organizationUnitPattern: '',
        localityPattern: '',
        statePattern: '',
        countryPattern: '',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: 'f251c37fca68418d988d69e0ff82edc7',
        certificateAuthorityName: 'rickCaUploadTest'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: 'yebc',
        accountCredential: null,
        enabled: true,
        type: null,
        projectId: null,
        privateKeyId: null,
        privateKey: null,
        clientEmail: null,
        clientId: null,
        authUri: null,
        tokenUri: null
      },
      enabled: true,
      keyLength: 2048,
      algorithm: 'SHA_256',
      certificateCount: 0,
      certificateNames: [],
      variables: [],
      networkIds: []
    },
    {
      id: 'b6d4e02728f14182a4e75a58a69ab912',
      description: null,
      name: 'Cert135551-template',
      caType: 'ONBOARD',
      defaultAccess: false,
      policySetId: null,
      onboard: {
        commonNamePattern: '',
        emailPattern: '',
        notAfterType: 'END_OF_YEAR',
        notAfterValue: 2,
        notBeforeType: 'END_OF_HOUR',
        notBeforeValue: 3,
        notAfterDate: null,
        notBeforeDate: null,
        ocspMonitorCutoffDays: 0,
        ocspMonitorEnabled: false,
        organizationPattern: '',
        organizationUnitPattern: '',
        localityPattern: '',
        statePattern: '',
        countryPattern: '',
        keyUsageList: null,
        certificateType: 'CLIENT',
        certificateAuthorityId: '9f627466a621412c8ea8752660935c90',
        certificateAuthorityName: '512-CA'
      },
      microsoftCa: null,
      custom: null,
      incommon: null,
      networkFx: null,
      chromebook: {
        apiKey: null,
        certRemovalType: 'NONE',
        enrollmentType: 'DEVICE',
        notifyAppId: 'yebc',
        accountCredential: null,
        enabled: true,
        type: null,
        projectId: null,
        privateKeyId: null,
        privateKey: null,
        clientEmail: null,
        clientId: null,
        authUri: null,
        tokenUri: null
      },
      enabled: true,
      keyLength: 2048,
      algorithm: 'SHA_256',
      certificateCount: 0,
      certificateNames: [],
      variables: [],
      networkIds: []
    }
  ]
}


