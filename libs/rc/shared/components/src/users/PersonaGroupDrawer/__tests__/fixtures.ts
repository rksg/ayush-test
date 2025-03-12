import {
  MacRegistrationPool,
  NewTablePageable,
  NewTableResult,
  PassphraseFormatEnum,
  PersonaGroup
} from '@acx-ui/rc/utils'

const defaultPageable: NewTablePageable = {
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

export const mockDpskList = {
  data: [
    {
      id: 'dpsk-pool-1',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expirationType: null
    },
    {
      id: '123456789b',
      name: 'DPSK Service 2',
      passphraseLength: 22,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationDate: '2022-12-07'
    },
    {
      id: '123456789c',
      name: 'DPSK Service 3',
      passphraseLength: 24,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationOffset: 2
    }
  ],
  page: 1,
  totalCount: 3,
  totalPages: 1
}

export const mockMacRegistrationList: NewTableResult<MacRegistrationPool> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [{
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    enabled: true,
    expirationEnabled: true,
    policySetId: 'string',
    expirationOffset: 1,
    expirationDate: 'string',
    defaultAccess: 'string',
    registrationCount: 0
  }]
}

export const mockPersonaGroup: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  personalIdentityNetworkId: 'nsgId-700',
  propertyId: 'propertyId-100'
}

export const mockPersonaGroupTableResult: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 3,
  totalPages: 1,
  content: [{
    id: 'persona-group-id-1',
    name: 'Class A',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-2',
    personalIdentityNetworkId: 'nsgId-700',
    propertyId: 'propertyId-100'
  },
  {
    id: 'cccccccc',
    name: 'Class B',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    personalIdentityNetworkId: 'nsgId-300',
    propertyId: 'propertyId-400'
  },
  {
    id: 'bbbbbbbb',
    name: 'Class C',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1'
  }]
}

export const certificateTemplateList = {
  fields: null,
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: 'e3adfb831d3f4e259617ebfa8b9eb0a1',
      description: null,
      name: 'certTemplate',
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
    }
  ]
}

export const mockAdaptivePolicySetTableResult = {
  paging: {
    totalCount: 1,
    page: 1,
    pageSize: 1,
    pageCount: 1
  },
  content: [
    {
      id: 'abb1a52d-fd77-434c-8895-36ee9a432ad1',
      name: '1010',
      description: '1010',
      mappedPolicyCount: 1,
      assignmentCount: 4,
      policyNames: [
        'policy1'
      ],
      externalAssignments: [
        {
          identityName: 'IdentityGroup',
          identityId: [
            '86a51b7d-1e15-4ad0-8d4a-504e08b845a2'
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
          identityName: 'template_022',
          identityId: [
            'eabc9db1eff948eeb902a22860213a42'
          ],
          links: []
        }
      ]
    }
  ]
}

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')
