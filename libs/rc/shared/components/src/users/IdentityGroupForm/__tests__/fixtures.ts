import {
  NewTablePageable,
  NewTableResult,
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
