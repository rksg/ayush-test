export const mockDirectoryServerNetworkList = {
  fields: ['name', 'id', 'nwSubType', 'captiveType'],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'test-network1',
      id: 'b0f7392bf29b42ec8a42f6ac70bfd960',
      nwSubType: 'aaa'
    },
    {
      name: 'test-network2',
      id: '2e69f425bbf84272a8e7b1be1c097a22',
      nwSubType: 'guest',
      captiveType: 'Cloudpath'
    },
    {
      name: 'test-network3',
      id: 'adfdc7ef63e94c8da16e379e7e443fd1',
      nwSubType: 'guest',
      captiveType: 'Directory'
    }
  ]
}

export const mockDirectoryServerDetail = {
  id: '49d2173ae5d943daa454af8de40fd4d9',
  name: 'ldap-profile4',
  tlsEnabled: false,
  adminDomainName: 'dc=tdcad,dc=com',
  adminPassword: '12345678',
  domainName: 'dc=tdcad,dc=com',
  host: '1.169.93.183',
  port: 389,
  type: 'LDAP'
}

export const mockDirectoryServerViewModelListResponse = {
  page: 1,
  totalCount: 2,
  data: [
    {
      wifiNetworkIds: [
        'b0f7392bf29b42ec8a42f6ac70bfd960',
        '2e69f425bbf84272a8e7b1be1c097a22',
        'adfdc7ef63e94c8da16e379e7e443fd1'
      ],
      port: 389,
      domainName: 'dc=tdcad,dc=com',
      tenantId: '13c94993c1894fadbcf7b68e1f94b876',
      name: 'ldap-profile4',
      host: '1.169.93.183',
      id: '49d2173ae5d943daa454af8de40fd4d9',
      type: 'LDAP'
    },
    {
      wifiNetworkIds: [],
      port: 389,
      domainName: 'ou=mathematicians,dc=example,dc=com',
      tenantId: '13c94993c1894fadbcf7b68e1f94b876',
      name: 'Online LDAP Test Server2',
      host: 'ldap.forumsys.com',
      id: '3596facbfd884b6da9ab40670c8ee397',
      type: 'AD'
    }
  ]
}