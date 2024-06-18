import { ExpirationType } from '@acx-ui/rc/utils'

export const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12',
      mappedPolicyCount: 2,
      assignmentCount: 1,
      policyNames: ['ap20', 'ap123'],
      externalAssignments: [
        {
          identityName: 'Mac-registration',
          identityId: ['47f3d966-4204-455a-aa23-749cec8e0484']
        }
      ]
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2',
      mappedPolicyCount: 0,
      assignmentCount: 0,
      policyNames: ['ap20', 'ap123'],
      externalAssignments: []
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4',
      mappedPolicyCount: 0,
      assignmentCount: 0,
      policyNames: ['ap20', 'ap123'],
      externalAssignments: []
    }
  ]
}

export const macList = {
  content: [
    {
      id: '47f3d966-4204-455a-aa23-749cec8e0484',
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
      policySetId: '1589413c-34e7-43a1-b070-fd85246144c8',
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
      networkIds: []
    },
    {
      id: '5d3639a8352744a0b01080cf0bd0613a',
      description: 'test',
      name: 'activity-template-test',
      caType: 'ONBOARD',
      defaultAccess: true,
      policySetId: 'a77b0f22-edd3-4f7f-87ce-00841c7295f0',
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

