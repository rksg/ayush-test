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
