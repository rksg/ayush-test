import { AAAPolicyType } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedPolicyId = '__Policy_ID__'
export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'

export const dummyAuthRadius: AAAPolicyType = {
  id: mockAuthRadiusId,
  name: 'auth-1',
  primary: {
    ip: '192.168.0.100',
    port: 1812,
    sharedSecret: '11111'
  },
  secondary: {
    ip: '192.168.0.101',
    port: 1812,
    sharedSecret: '222222'
  },
  type: 'AUTHENTICATION'
}

export const dummayAccounting: AAAPolicyType = {
  id: mockAccountingRadiusId,
  name: 'accounting-1',
  primary: {
    ip: '192.168.0.201',
    port: 1813,
    sharedSecret: '11111'
  },
  type: 'ACCOUNTING'
}

export const dummayRadiusServiceList = {
  totalCount: 1,
  page: 1,
  data: [{
    id: mockAuthRadiusId,
    name: 'auth-1',
    type: 'AUTHENTICATION',
    primary: '192.168.0.100:1812',
    secondary: '192.168.0.101:1812',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9'
  }, {
    id: mockAccountingRadiusId,
    name: 'accounting-1',
    type: 'ACCOUNTING',
    primary: '192.168.0.201:1813',
    secondary: '',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9'
  }]
}