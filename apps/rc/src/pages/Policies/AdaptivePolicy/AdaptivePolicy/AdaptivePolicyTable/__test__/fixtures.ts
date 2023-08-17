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

export const assignConditions = {
  paging: { totalCount: 2, page: 1, pageSize: 2, pageCount: 1 },
  content: [
    {
      id: '18f71dd5-eb2f-4f5f-baa8-c33df6f4abdf',
      policyId: 'debfe9d6-4e58-45ea-b8fb-c5a41ca62f37',
      templateAttributeId: 1010,
      templateAttribute: {
        id: 1010,
        name: 'Specific Time',
        // eslint-disable-next-line max-len
        description: 'Allows the user to define a specific time range for which this policy will allow access',
        attributeTextMatch: 'date-range-json',
        attributeType: 'DATE_RANGE'
      },
      evaluationRule: {
        criteriaType: 'DateRangeCriteria',
        when: 'All',
        startTime: '12:33:50',
        endTime: '08:59:59'
      }
    },
    {
      id: '15b8fe2e-775b-4394-a7f1-5c5869e4498e',
      policyId: 'debfe9d6-4e58-45ea-b8fb-c5a41ca62f37',
      templateAttributeId: 1012,
      templateAttribute: {
        id: 1012,
        name: 'DPSK Username',
        // eslint-disable-next-line max-len
        description: 'A regular expression defining the name of the DPSK that the user is authenticating with.',
        attributeTextMatch: 'Dpsk_Username',
        attributeType: 'STRING'
      },
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'rickTest22222'
      }
    }
  ]
}


export const vendorList = {
  supportedVendors: [
    'Bay-Networks',
    'UKERNA',
    'Packeteer',
    '3GPP'
  ]
}

export const radiusAttributeList = {
  totalCount: 2,
  page: 1,
  pageSize: 10000,
  data: [
    {
      id: 19910001,
      name: 'Foundry-Privilege-Level',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    },
    {
      id: 19910002,
      name: 'Foundry-Command-String',
      vendorName: 'Foundry',
      dataType: 'STRING',
      showOnDefault: true
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
