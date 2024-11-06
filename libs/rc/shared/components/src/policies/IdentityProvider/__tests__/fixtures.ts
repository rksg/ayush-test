import {
  AAAPolicyType,
  IdentityProviderViewModel,
  NaiRealmAuthInfoEnum,
  NaiRealmAuthTypeCredentialEnum,
  NaiRealmAuthTypeInnerEnum,
  NaiRealmAuthTypeNonEapEnum,
  NaiRealmAuthTypeTunneledEnum,
  NaiRealmEapMethodEnum,
  NaiRealmEcodingEnum,
  NaiRealmType,
  Network,
  TableResult
} from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedPolicyId = '__Policy_ID__'
export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockRadSecAuthRadiusId = '__Auth_Radius_ID__'
export const mockRadSecAccountingRadiusId = '__Accounting_Radius_ID_1__'

export const newEmptyData = {
  name: '',
  naiRealms: [] as NaiRealmType[],
  authRadiusId: '',
  accountingRadiusEnabled: false
}

export const editDataWithRealms = {
  ...newEmptyData,
  naiRealms: [{
    name: 'r1',
    encoding: NaiRealmEcodingEnum.RFC4282,
    eaps: [{
      method: NaiRealmEapMethodEnum.MD5,
      authInfos: [{
        info: NaiRealmAuthInfoEnum.Expanded,
        vendorId: '1',
        vendorType: '1'
      }, {
        info: NaiRealmAuthInfoEnum.Non_Eap,
        nonEapAuth: NaiRealmAuthTypeNonEapEnum.CHAP
      }, {
        info: NaiRealmAuthInfoEnum.Inner,
        eapInnerAuth: NaiRealmAuthTypeInnerEnum.EAP_TLS
      }, {
        info: NaiRealmAuthInfoEnum.Credential,
        credentialType: NaiRealmAuthTypeCredentialEnum.NFC
      }],
      rowId: 0
    }, {
      method: NaiRealmEapMethodEnum.PEAP,
      authInfos: [{
        info: NaiRealmAuthInfoEnum.Expanded_Inner,
        vendorId: '1',
        vendorType: '1'
      }, {
        info: NaiRealmAuthInfoEnum.Tunneled,
        tunneledType: NaiRealmAuthTypeTunneledEnum.Certificate
      }, {
        info: NaiRealmAuthInfoEnum.Credential,
        credentialType: NaiRealmAuthTypeCredentialEnum.SIM
      }],
      rowId: 1
    }],
    rowId: 0
  }, {
    name: 'r2',
    encoding: NaiRealmEcodingEnum.UTF8,
    eaps: [{
      method: NaiRealmEapMethodEnum.MD5,
      authInfos: [{
        info: NaiRealmAuthInfoEnum.Expanded,
        vendorId: '1',
        vendorType: '1'
      }],
      rowId: 0
    }],
    rowId: 1
  }, {
    name: 'r3',
    encoding: NaiRealmEcodingEnum.UTF8,
    rowId: 2
  }]
}

export const editDataWithPlmns = {
  ...newEmptyData,
  name: 'test1',
  plmns: [
    { mcc: '001', mnc: '005', rowId: 0 },
    { mcc: '002', mnc: '01', rowId: 1 }
  ]
}

export const editDataWithROIs = {
  ...newEmptyData,
  name: 'test1',
  roamConsortiumOIs: [
    { name: 'roi1', organizationId: '1a2b3c4d5e', rowId: 0 },
    { name: 'roi2', organizationId: 'ffffff', rowId: 1 }
  ]
}

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

export const dummyRadSecAuthRadius: AAAPolicyType = {
  id: mockRadSecAuthRadiusId,
  name: 'radSec-auth-1',
  primary: {
    ip: '192.168.1.100',
    port: 2083
  },
  radSecOptions: {
    tlsEnabled: true
  },
  type: 'AUTHENTICATION'
}

export const dummyRadSecAccounting: AAAPolicyType = {
  id: mockRadSecAccountingRadiusId,
  name: 'radSec-accounting-1',
  primary: {
    ip: '192.168.1.201',
    port: 2083
  },
  radSecOptions: {
    tlsEnabled: true
  },
  type: 'ACCOUNTING'
}

export const dummyRadSecRadiusServiceList = {
  totalCount: 1,
  page: 1,
  data: [{
    id: mockAuthRadiusId,
    name: 'radSec-auth-1',
    type: 'AUTHENTICATION',
    primary: '192.168.1.100:2083',
    radSecOptions: {
      tlsEnabled: true
    },
    networkCount: 0,
    networkIds: [],
    tenantId: '93a98239787940188137242bdf6795e9'
  }, {
    id: mockAccountingRadiusId,
    name: 'radSec-accounting-1',
    type: 'ACCOUNTING',
    primary: '192.168.1.201:2083',
    radSecOptions: {
      tlsEnabled: true
    },
    networkCount: 0,
    networkIds: [],
    tenantId: '93a98239787940188137242bdf6795e9'
  }]
}