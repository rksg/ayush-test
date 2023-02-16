import { AccessCondition, EvaluationRule } from '@acx-ui/rc/utils'

export const adpativePolicy = {
  id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
  name: 'test1',
  description: 'for test',
  policyType: 'RADIUS',
  onMatchResponse: 'test'
}

export const assignConditions = {
  paging: { totalCount: 1, page: 1, pageSize: 8, pageCount: 1 },
  content: [
    {
      id: '73eff1f1-8e9f-418c-8893-698387617d73',
      policyId: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      templateAttributeId: 11,
      name: 'for test',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      } as EvaluationRule
    }
  ] as AccessCondition []
}


