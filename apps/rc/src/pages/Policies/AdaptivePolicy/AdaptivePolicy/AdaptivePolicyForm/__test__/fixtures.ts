import { DataType, OperatorType } from '@acx-ui/rc/utils'

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


