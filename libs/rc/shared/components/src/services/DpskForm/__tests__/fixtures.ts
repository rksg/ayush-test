import {
  DpskSaveData,
  ExpirationType,
  PassphraseFormatEnum,
  ServiceType,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'

export const mockedServiceId = '__Service_ID__'

// eslint-disable-next-line max-len
export const createPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })
// eslint-disable-next-line max-len
export const editPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })

export const mockedCreateFormData: DpskSaveData = {
  name: 'Fake DPSK for Create',
  passphraseLength: 16,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: ExpirationType.DAYS_AFTER_TIME,
  expirationOffset: 5
}

export const mockedEditFormData: DpskSaveData = {
  id: '12345',
  name: 'Fake DPSK for Edit',
  passphraseLength: 22,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  expirationType: ExpirationType.HOURS_AFTER_TIME,
  expirationOffset: 3
}

export const mockedGetFormData: DpskSaveData = {
  name: 'Get DPSK',
  passphraseLength: 16,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  expirationType: ExpirationType.DAYS_AFTER_TIME,
  expirationOffset: 5
}

export const mockedDpskList = {
  content: [
    {
      id: '123456789',
      name: 'Fake DPSK2',
      passphraseLength: 32,
      passphraseFormat: 'KEYBOARD_FRIENDLY',
      expirationType: 'SPECIFIED_DATE',
      expirationDate: '2022-12-07'
    }
  ],
  totalElements: 1,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

export const mockedPolicySet = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: 'd1647c14-79fd-4f58-a048-5559aa8ecf66',
      name: 'aps2',
      description: 'aps2',
      _links: {
        self: {
          href: 'https://api.dev.ruckus.cloud/'
        },
        policies: {
          href: 'https://api.dev.ruckus.cloud/policySets'
        }
      }
    },
    {
      id: '8839b91d-c55c-4672-bf75-9aa54779d105',
      name: 'aps3',
      description: 'aps3',
      _links: {
        self: {
          href: 'https://api.dev.ruckus.cloud/'
        },
        policies: {
          href: 'https://api.dev.ruckus.cloud/policySets/'
        }
      }
    }
  ]
}

export const policySetList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '50f5cec9-850d-483d-8272-6ee5657f53da',
      name: 'testPolicySet',
      description: 'for test'
    },
    {
      id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
      name: 'testPolicySet1',
      description: 'for test'
    }
  ]
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
      policySetId: 'abb1a52d-fd77-434c-8895-36ee9a432ad1',
      links: [
        {
          rel: 'self',
          href: 'https://api.dev.ruckus.cloud/identityGroups/86a51b7d-1e15-4ad0-8d4a-504e08b845a2'
        }
      ],
      personalIdentityNetworkId: null,
      identities: null,
      identityCount: 0
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
      policySetId: null,
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

export const mockedTemplateList = {
  paging: { totalCount: 2, page: 1, pageSize: 2, pageCount: 1 },
  content: [
    {
      id: 200,
      name: 'RADIUS Conditions',
      description: 'Evaluates RADIUS policy conditions from the currently supported list.',
      returnType: 'RADIUS_ATTRIB_GROUP',
      ruleType: 'RADIUS'
    },
    {
      id: 100,
      name: 'DSPK Policy Conditions',
      description: 'Evaluates DPSK properties from the currently supported list.',
      returnType: 'RADIUS_ATTRIB_GROUP',
      ruleType: 'DPSK'
    }
  ]
}

export const mockedAdaptivePolicyList = {
  paging: {
    totalCount: 1,
    page: 1,
    pageSize: 1,
    pageCount: 1
  },
  content: [
    {
      id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      name: 'test1',
      description: 'for test',
      policyType: 'RADIUS',
      onMatchResponse: 'test'
    }
  ]
}
