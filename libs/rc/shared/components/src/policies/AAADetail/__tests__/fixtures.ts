export const aaaServerNetworkList = {
  fields: ['name', 'id', 'nwSubType', 'captiveType'],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'NotOnlyAAA',
      id: 'b0f7392bf29b42ec8a42f6ac70bfd960',
      nwSubType: 'aaa'
    },
    {
      name: 'capTemp - copy',
      id: '2e69f425bbf84272a8e7b1be1c097a22',
      nwSubType: 'guest',
      captiveType: 'Cloudpath'
    },
    {
      name: '000Jacky11',
      id: 'fda58a3106b34eaf9caad5320dfeab21',
      nwSubType: 'guest',
      captiveType: 'WISPr'
    }
  ]
}

export const aaaServerDetail = {
  id: 1,
  name: 'test',
  type: 'AUTHENTICATION',
  primary: {
    ip: '2.2.2.2',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.2.2.2',
    port: 102,
    sharedSecret: 'xxxxxxxx'
  }
}

export const mockAAAPolicyViewModelListResponse = {
  page: 1,
  totalCount: 2,
  data: [
    {
      name: 'Auth',
      type: 'AUTHENTICATION',
      primary: '11.11.11.1:1812',
      id: '1',
      networkIds: []
    },
    {
      name: 'Acct',
      type: 'ACCOUNTING',
      primary: '12.12.12.1:1011',
      secondary: '12.12.12.2:1187',
      id: '2'
    }
  ]
}

export const mockAAAPolicyTemplateListResponse = {
  page: 1,
  totalCount: 2,
  data: [
    {
      name: 'AAA-Template1',
      type: 'AUTHENTICATION',
      primary: '11.11.11.1:1812',
      id: '1'
    },
    {
      name: 'AAA-Template2',
      type: 'ACCOUNTING',
      primary: '12.12.12.1:1011',
      secondary: '12.12.12.2:1187',
      id: '2'
    }
  ]
}

export const mockAAAPolicyTemplateResponse = mockAAAPolicyTemplateListResponse.data[1]
