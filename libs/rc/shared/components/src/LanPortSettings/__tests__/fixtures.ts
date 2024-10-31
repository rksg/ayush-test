export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAuthRadiusId2 = '__Auth_Radius_ID_2__'
export const mockAuthRadiusName = '__Auth_Radius_Name__'
export const mockAuthRadiusName2 = '__Auth_Radius_Name_2__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockAccuntingRadiusName = '__Accounting_Radius_Name_1__'
export const mockDefaultTrunkEthertnetPortProfileId = 'mockDefaultTrunkEthertnetPortProfile'

export const ethernetPortProfileList = [
  {
    id: mockDefaultTrunkEthertnetPortProfileId,
    tenantId: 'tenant-id',
    name: 'Default Trunk',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    authType: 'DISABLED',
    isDefault: true,
    apSerialNumbers: [
      '123456789042'
    ],
    apActivations: [
      {
        venueId: '4b6dc218411d4b8cade17d16a034bcbb',
        apSerialNumber: '123456789042',
        portId: 1
      },
      {
        venueId: '4b6dc218411d4b8cade17d16a034bcbb',
        apSerialNumber: '123456789042',
        portId: 2
      }
    ]
  }
]

export const mockDefaultTunkEthertnetPortProfile = {
  id: mockDefaultTrunkEthertnetPortProfileId,
  tenantId: 'tenant-id',
  name: 'Default Trunk',
  type: 'TRUNK',
  untagId: 1,
  vlanMembers: '1-4094',
  authType: 'DISABLED',
  isDefault: true
}

export const dummyRadiusServiceList = {
  totalCount: 3,
  page: 1,
  data: [{
    id: mockAuthRadiusId,
    name: mockAuthRadiusName,
    type: 'AUTHENTICATION',
    primary: '192.168.0.100:1812',
    secondary: '192.168.0.101:1812',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9'
  }, {
    id: mockAuthRadiusId2,
    name: mockAuthRadiusName2,
    type: 'AUTHENTICATION',
    primary: '192.168.0.200:1812',
    secondary: '192.168.0.210:1812',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9'
  }, {
    id: mockAccountingRadiusId,
    name: mockAccuntingRadiusName,
    type: 'ACCOUNTING',
    primary: '192.168.0.201:1813',
    secondary: '',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9'
  }]
}