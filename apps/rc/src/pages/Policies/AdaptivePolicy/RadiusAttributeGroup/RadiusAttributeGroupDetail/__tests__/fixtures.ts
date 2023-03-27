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
  ]
}

export const policyList = {
  paging: { totalCount: 4, page: 1, pageSize: 4, pageCount: 1 },
  content: [
    {
      id: 'b2c5c105-c1f9-473c-afc8-5aa28d282ba3',
      name: 'ap2',
      policyType: 'DPSK',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471'
    },
    {
      id: 'e681f673-cb0f-4e8d-a4ae-f18e141c496d',
      name: 'ap3',
      policyType: 'RADIUS',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471'
    },
    {
      id: '1dd6a24d-a529-401f-a580-a922c42e3a70',
      name: 'ap5',
      policyType: 'DPSK',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471'
    },
    {
      id: '26032241-e3cb-4a28-b7a5-a95de38d0f8b',
      name: 'ap6',
      policyType: 'RADIUS',
      onMatchResponse: '6189213e-3cbd-4f76-a181-08ed2449b471'
    }
  ]
}

