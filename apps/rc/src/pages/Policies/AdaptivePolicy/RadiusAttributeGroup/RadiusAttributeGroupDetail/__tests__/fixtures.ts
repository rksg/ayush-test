export const mockGroup = {
  name: 'group1',
  id: 'a954a698-d40b-ae3e-ddbd-e08210c8d4b9',
  description: 'test',
  attributeAssignments: [
    {
      attributeName: 'attributeName1',
      attributeValue: 'attributeValue1',
      dataType: 'INTEGER',
      operator: 'DOES_NOT_EXIST'
    },
    {
      attributeName: 'attributeName2',
      attributeValue: 'attributeValue2',
      dataType: 'INTEGER',
      operator: 'DOES_NOT_EXIST'
    }
  ],
  attributeCount: 2,
  externalAssignmentsCount: 0
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

export const prioritizedPolicies = {
  paging: { totalCount: 3, page: 1, pageSize: 3, pageCount: 1 },
  content: [
    {
      policyId: '346314c9-a3ce-40dd-ab5a-7b99002bd736',
      priority: 0
    },
    {
      policyId: 'c956f012-67e5-4c46-9ded-2a35b4aa9f36',
      priority: 1
    },
    {
      policyId: 'a15323aa-2b45-403f-8d2d-20d41c9e8002',
      priority: 2
    }
  ]
}

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

export const policyList = {
  paging: { totalCount: 4, page: 1, pageSize: 4, pageCount: 1 },
  content: [
    {
      id: '346314c9-a3ce-40dd-ab5a-7b99002bd736',
      name: 'ap2',
      policyType: 'DPSK',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471',
      policySetCount: 2,
      conditionsCount: 0,
      policySetNames: ['ps12', 'ps2']
    },
    {
      id: 'e681f673-cb0f-4e8d-a4ae-f18e141c496d',
      name: 'ap3',
      policyType: 'RADIUS',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471',
      policySetCount: 0,
      conditionsCount: 0
    },
    {
      id: '1dd6a24d-a529-401f-a580-a922c42e3a70',
      name: 'ap5',
      policyType: 'DPSK',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471',
      policySetCount: 0,
      conditionsCount: 0
    },
    {
      id: '26032241-e3cb-4a28-b7a5-a95de38d0f8b',
      name: 'ap6',
      policyType: 'RADIUS',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471',
      policySetCount: 0,
      conditionsCount: 0
    }
  ]
}

