import {
  AAAPolicyType,
  IdentityProviderViewModel,
  NaiRealmAuthInfoEnum,
  NaiRealmEapMethodEnum,
  NaiRealmEcodingEnum,
  Network
} from '@acx-ui/rc/utils'
import { TableResult } from '@acx-ui/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedPolicyId = '__Policy_ID__'
export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'


export const dummyIdenetityPrividerData1 = {
  id: mockAccountingRadiusId,
  name: 'HS20 Identity Provider 1',
  naiRealms: [{
    name: 'abc.com',
    encoding: NaiRealmEcodingEnum.RFC4282,
    eaps: [{
      method: NaiRealmEapMethodEnum.MD5,
      authInfos: [{
        info: NaiRealmAuthInfoEnum.Expanded,
        vendorId: '1',
        vendorType: '1'
      }]
    }]
  }],
  plmns: [{ mcc: '001', mnc: '005' }],
  roamConsortiumOIs: [{ name: 'roi1', organizationId: '1a2b3c4d5e' }],
  dynamicVlan: 10,
  accountingRadiusEnabled: true,
  authRadiusId: mockAuthRadiusId,
  accountingRadiusId: mockAccountingRadiusId
}

export const dummyIdenetityPrividerData2 = {
  id: mockAccountingRadiusId2,
  name: 'HS20 Identity Provider 2',
  naiRealms: [{ name: 'xyz.com', encoding: NaiRealmEcodingEnum.UTF8 }],
  accountingRadiusEnabled: false,
  authRadiusId: mockAuthRadiusId
}

export const dummyTableResult: TableResult<IdentityProviderViewModel> = {
  totalCount: 2,
  page: 1,
  data: [{
    ...dummyIdenetityPrividerData1,
    wifiNetworkIds: ['0c41e2e116514dc698c53dc8c752a1b8']
  }, {
    ...dummyIdenetityPrividerData2,
    wifiNetworkIds: ['0c41e2e116514dc698c53dc8c752a1b8']
  }]
}

export const dummyNetworksResult: TableResult<Network> = {
  totalCount: 1,
  page: 1,
  data: [{
    id: '0c41e2e116514dc698c53dc8c752a1b8',
    name: 'AAA Network-1',
    description: '',
    ssid: 'AAA Network-1',
    nwSubType: 'aaa',
    activated: { isActivated: true },
    vlan: 1,
    aps: 0,
    clients: 0,
    venues: {
      count: 1,
      ids: [
        '83a98239787940188137242bdf6795e9'
      ],
      names: [
        'My Venue'
      ]
    }
  }]
}

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