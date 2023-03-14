export const policySetList = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      id: 'e4fc0210-a491-460c-bd74-549a9334325a',
      name: 'ps12',
      description: 'ps12'
    },
    {
      id: 'a76cac94-3180-4f5f-9c3b-50319cb24ef8',
      name: 'ps2',
      description: 'ps2'
    },
    {
      id: '2f617cdd-a8b7-47e7-ba1e-fd41caf3dac8',
      name: 'ps4',
      description: 'ps4'
    }
  ]
}

export const adaptivePolicyList = {
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

export const editAdaptivePolicy = {
  id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
  name: 'test1',
  description: 'for test',
  policyType: 'RADIUS',
  onMatchResponse: 'test'
}

export const assignConditions = {
  paging: { totalCount: 1, page: 1, pageSize: 1, pageCount: 1 },
  content: [
    {
      id: 'a81bb403-d5e6-4c2b-a525-3bfbabebb48c',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2017,
      name: 'Called Station Id',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      }
    },
    {
      id: 'a81bb403-d5e6-4c2b-a525-3bfbabebb123',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2018,
      name: 'Client Shortname',
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      }
    }
  ]
}

export const templateList = {
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


