import {
  DirectoryServer,
  DirectoryServerProfileEnum,
  DirectoryServerViewData
} from '@acx-ui/rc/utils'

export const mockDirectoryServer: DirectoryServer = {
  id: 'a5ac9a7a3be54dba9c8741c67d1c41fa',
  name: 'Online LDAP Test Server1',
  type: DirectoryServerProfileEnum.AD,
  tlsEnabled: false,
  host: 'ldap.test.com',
  port: 636,
  domainName: 'ou=mathematicians,dc=example,dc=com',
  adminDomainName: 'cn=read-only-admin,dc=example,dc=com',
  adminPassword: 'password',
  keyAttribute: '',
  searchFilter: ''
}

export const mockDirectoryServerTable = {
  data: {
    fields: null,
    totalCount: 3,
    page: 1,
    data: [
      {
        id: 'a5ac9a7a3be54dba9c8741c67d1c41fa',
        name: 'Online LDAP Test Server1',
        type: DirectoryServerProfileEnum.AD,
        host: 'ldap.test1.com',
        port: 636,
        domainName: 'ou=mathematicians,dc=example,dc=com'
      },
      {
        id: '49d2173ae5d943daa454af8de40fd4d9',
        name: 'Online LDAP Test Server2',
        type: DirectoryServerProfileEnum.AD,
        host: 'ldap.test2.com',
        port: 389,
        domainName: 'ou=mathematicians,dc=example,dc=com'
      },
      {
        id: '58d667552aac4fc3bc235cf39bfbe889',
        name: 'Online LDAP Test Server3',
        type: DirectoryServerProfileEnum.LDAP,
        host: 'ldap.test3.com',
        port: 389,
        domainName: 'ou=mathematicians,dc=example,dc=com'
      }
    ] as DirectoryServerViewData[]
  },
  isFetching: false,
  handleTableChange: () => {},
  handleFilterChange: () => {}
}
