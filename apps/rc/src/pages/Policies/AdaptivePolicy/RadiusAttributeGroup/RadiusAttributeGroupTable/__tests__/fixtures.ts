export const groupList = {
  content: [
    {
      name: 'group1',
      id: 'a954a698-d40b-ae3e-ddbd-e08210c8d4b9',
      description: 'test',
      attributeAssignments: [
        {
          attributeName: 'attributeName1',
          attributeValue: 'test',
          dataType: 'INTEGER',
          operator: 'DOES_NOT_EXIST'
        },
        {
          attributeName: 'attributeName2',
          attributeValue: 'test',
          dataType: 'INTEGER',
          operator: 'DOES_NOT_EXIST'
        }
      ],
      attributeCount: 2,
      externalAssignmentsCount: 2,
      externalServiceAssignments: [
        {
          serviceName: 'policy-management',
          externalAssignmentIdentifier: [
            '0c641adc-2053-43e1-a684-0fddc3382e1a',
            'd4973820-0d43-4a1a-8110-53b11761da9d'
          ]
        }
      ]
    },
    {
      name: 'group2',
      id: 'a954a698-d40b-ae3e-ddbd-e08210c8d4c9',
      description: 'test',
      attributeAssignments: [
        {
          attributeName: 'attributeName1',
          attributeValue: 'test',
          dataType: 'INTEGER',
          operator: 'DOES_NOT_EXIST'
        },
        {
          attributeName: 'attributeName2',
          attributeValue: 'test',
          dataType: 'INTEGER',
          operator: 'DOES_NOT_EXIST'
        }
      ],
      attributeCount: 2,
      externalAssignmentsCount: 0,
      externalServiceAssignments: []
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
  numberOfElements: 3,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

export const groupListByPost = {
  totalCount: 1,
  page: 1,
  pageSize: 10,
  data: groupList.content
}


export const adaptivePolicyList = {
  paging: {
    totalCount: 0,
    page: 1,
    pageSize: 0,
    pageCount: 0
  },
  content: [{
    id: 'd5b8b080-5390-459c-b17c-0e1677c3f5a8',
    name: 'test1',
    description: 'for test',
    policyType: 'RADIUS',
    onMatchResponse: 'test'
  }]
}

export const assignments = {
  content: [
    {
      id: 'e35dcc0d-31c9-4fb9-8a8d-49395da6fd83',
      externalAssignmentIdentifier: 'd5b8b080-5390-459c-b17c-0e1677c3f5a8',
      serviceName: 'policy-management'
    }
  ],
  pageable: {
    sort: { sorted: true, unsorted: false, empty: false },
    pageNumber: 0,
    pageSize: 2000,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalElements: 1,
  totalPages: 1,
  last: true,
  first: true,
  numberOfElements: 1,
  sort: { sorted: true, unsorted: false, empty: false },
  size: 2000,
  number: 0,
  empty: false
}

