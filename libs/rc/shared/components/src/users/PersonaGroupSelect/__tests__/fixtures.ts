import { NewTablePageable, NewTableResult, PersonaGroup } from '@acx-ui/rc/utils'

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

export const personaGroupList: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalPages: 1,
  totalElements: 1,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    },
    {
      id: 'persona-group-id-2',
      name: 'persona-group-name-2',
      propertyId: 'property-id-2'
    }
  ]
}

