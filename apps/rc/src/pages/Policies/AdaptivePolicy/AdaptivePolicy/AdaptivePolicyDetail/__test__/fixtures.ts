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

export const attributeList = {
  paging: {
    totalCount: 9,
    page: 1,
    pageSize: 9,
    pageCount: 1
  },
  content: [
    {
      id: 2010,
      name: 'Specific Time',
      description: 'Allows the user to define a specific time range for which ' +
        'this policy will allow access',
      attributeTextMatch: 'date-range-json',
      attributeType: 'withinDateRange'
    },
    {
      id: 2011,
      name: 'Wireless Network "SSID"',
      description: 'A regular expression defining the Wi-Fi SSID(s) to limit the this policy.',
      attributeTextMatch: 'SSID',
      attributeType: 'regex'
    },
    {
      id: 2012,
      name: 'NAS Identifier',
      description: 'A regular expression defining the NAS Identifier(s) to limit this policy.',
      attributeTextMatch: 'NAS-Identifier',
      attributeType: 'regex'
    },
    {
      id: 2013,
      name: 'Radius User Name',
      description: 'A regular expression defining the User-Name(s) to limit this policy. ' +
        'Could be name, could be realm.',
      attributeTextMatch: 'User-Name',
      attributeType: 'regex'
    },
    {
      id: 2014,
      name: 'Radius Client',
      description: 'A regular expression defining the radius client to evaulate this policy.',
      attributeTextMatch: 'RadiusClient',
      attributeType: 'regex'
    },
    {
      id: 2015,
      name: 'Client Shortname',
      description: "A regular expression defining the client's short name to limit this policy.",
      attributeTextMatch: 'Client-Shortname',
      attributeType: 'regex'
    },
    {
      id: 2016,
      name: 'Device MAC Address',
      description: "A regular expression defining the device's MAC Address to limit this policy.",
      attributeTextMatch: 'MacAddress',
      attributeType: 'regex'
    },
    {
      id: 2017,
      name: 'Called Station Id',
      description: "A regular expression defining the device's MAC Address to limit this policy.",
      attributeTextMatch: 'Called-Station-Id',
      attributeType: 'regex'
    },
    {
      id: 2018,
      name: 'NAS IP Address',
      description: 'A regular expression defining the NAS Identifier(s) to limit this policy.',
      attributeTextMatch: 'NAS-IP-Address',
      attributeType: 'regex'
    }
  ]
}

export const assignConditions = {
  paging: { totalCount: 1, page: 1, pageSize: 8, pageCount: 1 },
  content: [
    {
      id: '73eff1f1-8e9f-418c-8893-698387617d73',
      policyId: '83d6fc05-60b0-44c2-9e9c-0b3c9854a858',
      templateAttributeId: 2013,
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      } as EvaluationRule
    }
  ] as AccessCondition []
}

export const conditionsInPolicy ={
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



