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

export const attributeGroupReturnByQuery = {
  totalCount: 1,
  page: 1,
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

export const attributeGroup = {
  id: '1751383c-f13a-4f55-9694-ca9d16d4c410',
  name: 'test11223',
  description: 'test1',
  attributeAssignments: [
    {
      attributeName: 'Annex-CLI-Filter',
      operator: 'ADD',
      attributeValue: '111111',
      dataType: 'STRING'
    },
    {
      attributeName: 'Annex-CLI-Command',
      operator: 'ADD',
      attributeValue: 'wdqdwqdw',
      dataType: 'STRING'
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

export const attributeList = {
  totalCount: 11,
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
    },
    {
      id: 19910003,
      name: 'Foundry-Command-Exception-Flag',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    },
    {
      id: 19910004,
      name: 'Foundry-INM-Privilege',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    },
    {
      id: 19910005,
      name: 'Foundry-Access-List',
      vendorName: 'Foundry',
      dataType: 'STRING',
      showOnDefault: true
    },
    {
      id: 19910006,
      name: 'Foundry-MAC-Authent-needs-802.1x',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    },
    {
      id: 19910007,
      name: 'Foundry-802.1x-Valid-Lookup',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    },
    {
      id: 19910008,
      name: 'Foundry-MAC-Based-Vlan-QoS',
      vendorName: 'Foundry',
      dataType: 'INTEGER',
      showOnDefault: true
    }
  ]
}
