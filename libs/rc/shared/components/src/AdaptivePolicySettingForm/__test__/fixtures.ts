import { CriteriaOption } from '@acx-ui/rc/utils'

export const assignConditions = {
  paging: { totalCount: 1, page: 1, pageSize: 1, pageCount: 1 },
  content: [
    {
      id: 'a81bb403-d5e6-4c2b-a525-3bfbabebb48c',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2012,
      templateAttribute: {
        id: 2012,
        name: 'Device MAC Address',
        description: "A regular expression defining the device's MAC Address to limit this policy.",
        attributeTextMatch: 'MacAddress',
        attributeType: 'STRING'
      },
      evaluationRule: {
        criteriaType: CriteriaOption.STRING,
        regexStringCriteria: 'AA:BB:CC:DD:EE:FF'
      }
    },
    {
      id: '18f71dd5-eb2f-4f5f-baa8-c33df6f4abd2',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2010,
      templateAttribute: {
        id: 2010,
        name: 'Specific Time',
        // eslint-disable-next-line max-len
        description: 'Allows the user to define a specific time range for which this policy will allow access',
        attributeTextMatch: 'date-range-json',
        attributeType: 'DATE_RANGE'
      },
      evaluationRule: {
        criteriaType: CriteriaOption.DATE_RANGE,
        when: 'All',
        startTime: '09:15:25',
        endTime: '11:59:59'
      }
    },
    {
      id: '18f71dd5-eb2f-4f5f-baa8-c33df6f4abdf',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2013,
      templateAttribute: {
        id: 2013,
        name: 'Radius User Name',
        description: 'A regular expression defining the User-Name(s) to limit this policy. ' +
          'Could be name, could be realm.',
        attributeTextMatch: 'User-Name',
        attributeType: 'regex'
      },
      evaluationRule: {
        criteriaType: CriteriaOption.STRING,
        regexStringCriteria: 'AA:BB:CC:DD:EE:FF'
      }
    },
    {
      id: '18f71dd5-eb2f-4f5f-baa8-c33df6f4abdf',
      policyId: '20214c9d-3334-471a-8fc5-c621f43b59b9',
      templateAttributeId: 2020,
      templateAttribute: {
        id: 2020,
        name: 'Radius User Name',
        description: 'A regular expression defining the phone to limit this policy.',
        attributeTextMatch: 'identity_phone',
        attributeType: 'regex',
        category: 'identity'
      },
      evaluationRule: {
        criteriaType: CriteriaOption.STRING,
        regexStringCriteria: 'AA:BB:CC:DD:EE:FF'
      }
    }
  ]
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
    },
    {
      id: 2019,
      name: 'Email',
      description: 'A regular expression defining the email to limit this policy.',
      attributeTextMatch: 'identity_email',
      attributeType: 'regex',
      category: 'identity'
    },
    {
      id: 2020,
      name: 'Phone',
      description: 'A regular expression defining the phone number to limit this policy.',
      attributeTextMatch: 'identity_phone',
      attributeType: 'regex',
      category: 'identity'
    },
    {
      id: 2021,
      name: 'Identity Name',
      description: 'A regular expression defining the name to limit this policy.',
      attributeTextMatch: 'identity_name',
      attributeType: 'regex',
      category: 'identity'
    }
  ]
}

export const groupList = {
  totalCount: 24,
  page: 1,
  pageSize: 10,
  data: [
    {
      id: '520e34e0-9dbd-49a7-abb1-bfbd0185d908',
      name: 'group1',
      description: '1111',
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
      attributeCount: 3,
      externalAssignmentsCount: 4,
      externalServiceAssignments: [
        {
          serviceName: 'policy-management',
          externalAssignmentIdentifier: [
            '10eda62b-8be8-4d07-b4ab-6e815e89f971',
            '3c758416-9b86-406a-b85d-b16dc3feda2a',
            'c3e08422-09ea-4d37-b91e-975bd360b50d',
            'cc1a1734-eaa1-4536-8131-a9aec4995755'
          ]
        }
      ]
    },
    {
      id: '14b8183e-92a7-4b80-bd12-278f43953ebc',
      name: '123',
      description: '123',
      attributeAssignments: [
        {
          attributeName: 'Callback-Number',
          operator: 'ADD',
          attributeValue: '1111',
          dataType: 'STRING'
        }
      ],
      attributeCount: 1,
      externalAssignmentsCount: 1,
      externalServiceAssignments: [
        {
          serviceName: 'policy-management',
          externalAssignmentIdentifier: [
            '90556908-e588-4818-9d43-c886f3225b13'
          ]
        }
      ]
    }
  ]
}

export const attributeGroupReturnByQuery = {
  totalCount: 1,
  page: 0,
  pageSize: 10,
  data: [
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
      ]
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
