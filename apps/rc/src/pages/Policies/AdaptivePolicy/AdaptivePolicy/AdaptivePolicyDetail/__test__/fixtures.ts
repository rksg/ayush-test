import { AccessCondition, EvaluationRule } from '@acx-ui/rc/utils'

export const policyList = {
  paging: { totalCount: 2, page: 1, pageSize: 2, pageCount: 1 },
  content: [
    {
      id: '83d6fc05-60b0-44c2-9e9c-0b3c9854a858',
      name: 'dpsk1',
      policyType: 'DPSK',
      onMatchResponse: 'testResponse'
    },
    {
      id: '4c22002b-8ff6-4aa7-9d90-fbdad7a14222',
      name: 'dpsk2',
      policyType: 'DPSK',
      onMatchResponse: 'testResponse'
    }
  ]
}


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
      policyId: '83d6fc05-60b0-44c2-9e9c-0b3c9854a858',
      templateAttributeId: 11,
      name: 'for test',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      } as EvaluationRule
    }
  ] as AccessCondition []
}

export const templateList = {
  paging: { totalCount: 2, page: 1, pageSize: 2, pageCount: 1 },
  content: [
    {
      id: 100,
      name: 'DSPK Policy Conditions',
      description: 'Evaluates DPSK properties from the currently supported list.',
      returnType: 'RADIUS_ATTRIB_GROUP',
      ruleType: 'DPSK'
    },
    {
      id: 200,
      name: 'RADIUS Conditions',
      description: 'Evaluates RADIUS policy conditions from the currently supported list.',
      returnType: 'RADIUS_ATTRIB_GROUP',
      ruleType: 'RADIUS'
    }
  ]
}



