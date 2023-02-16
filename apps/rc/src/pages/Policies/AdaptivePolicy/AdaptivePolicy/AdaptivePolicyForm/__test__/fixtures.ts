import { DataType, EvaluationRule, OperatorType } from '@acx-ui/rc/utils'

export const adpativePolicyList = {
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

export const editAdpativePolicy = {
  id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
  name: 'test1',
  description: 'for test',
  policyType: 'RADIUS',
  onMatchResponse: 'test'
}

export const assignConditions = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '73eff1f1-8e9f-418c-8893-698387617d73',
      policyId: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      templateAttributeId: 11,
      name: 'test',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      } as EvaluationRule
    },
    {
      id: 'dd9c41f3-a420-43c4-a029-83230f27a4e0',
      policyId: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      templateAttributeId: 12,
      name: 'test2',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      } as EvaluationRule
    }
  ]
}

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
          dataType: DataType.INTEGER,
          operator: OperatorType.ADD_REPLACE
        },
        {
          attributeName: 'attributeName2',
          attributeValue: 'test',
          dataType: DataType.INTEGER,
          operator: OperatorType.DOES_NOT_EXIST
        }
      ]
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


