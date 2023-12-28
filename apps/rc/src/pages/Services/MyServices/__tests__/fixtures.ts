export const mockWifiCallingTableResult = {
  fields: ['ePDGs', 'epdg', 'qosPriority', 'networkIds', 'epdgs', 'name', 'tenantId', 'id'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'b6ebccae545c44c1935ddaf746f5b048',
      name: 'wifi-1',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      networkIds: [],
      tenantId: '1977de24c7824b0b975c4d02806e081f',
      epdgs: [
        {
          domain: 'a.b.comd'
        }
      ]
    }
  ]
}

export const mockedTableResult = {
  totalCount: 0,
  page: 0,
  data: []
}

export const dpskListResponse = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

export const mockedPortalList = {
  content: [],
  paging: { page: 1, pageSize: 10, totalCount: 0 }
}
