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

export const assignConditions = {
  paging: { totalCount: 8, page: 1, pageSize: 8, pageCount: 1 },
  content: [
    {
      id: 11,
      name: 'Wireless Network "SSID"',
      description: 'A regular expression defining the Wi-Fi SSID(s) to limit the this policy.',
      attributeTextMatch: 'SSID',
      attributeType: 'regex'
    },
    {
      id: 12,
      name: 'NAS Identifier',
      description: 'A regular expression defining the NAS Identifier(s) to limit this policy.',
      attributeTextMatch: 'NAS-Identifier',
      attributeType: 'regex'
    },
    {
      id: 13,
      name: 'Radius User Name',
      description: 'A regular expression defining the User-Name(s) to limit this policy. ' +
        'Could be name, could be realm.',
      attributeTextMatch: 'User-Name',
      attributeType: 'regex'
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
