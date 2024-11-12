export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAuthRadiusId2 = '__Auth_Radius_ID_2__'
export const mockAuthRadiusName = '__Auth_Radius_Name__'
export const mockAuthRadiusName2 = '__Auth_Radius_Name_2__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockAccuntingRadiusName = '__Accounting_Radius_Name_1__'
export const mockDefaultTrunkEthertnetPortProfileId = 'tenant-id_TRUNK'
export const mockTrunkEthertnetPortProfileId1 = 'mockTrunkEthertnetPortProfileId1'
export const mockAccessEthertnetPortProfileId1 = 'mockAccessEthertnetPortProfileId1'
export const trunkWithPortBasedName = 'Trunk with Port Based'

export const ethernetPortProfileList = [
  {
    id: mockDefaultTrunkEthertnetPortProfileId,
    tenantId: 'tenant-id',
    name: 'Default Trunk',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    authType: 'DISABLED',
    isDefault: true
  },
  {
    id: mockTrunkEthertnetPortProfileId1,
    tenantId: 'tenant-id',
    name: trunkWithPortBasedName,
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    isDefault: false,
    authRadiusId: mockAuthRadiusId,
    authType: 'PORT_BASED_AUTHENTICATOR',
    apSerialNumbers: [
      '123456789042'
    ],
    apActivations: []
  },
  {
    id: mockAccessEthertnetPortProfileId1,
    tenantId: 'tenant-id',
    name: 'access Profile 1',
    type: 'ACCESS',
    untagId: 1,
    vlanMembers: '1',
    isDefault: false,
    authType: 'DISABLED',
    apSerialNumbers: [],
    apActivations: []
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

export const selectedTrunkPortCaps = {
  defaultType: 'TRUNK',
  id: '1',
  isPoeOutPort: false,
  isPoePort: false,
  supportDisable: true,
  trunkPortOnly: true,
  untagId: 1,
  vlanMembers: '1-4094',
  enabled: true,
  vni: 0
}

export const selectedSinglePortModel = {
  lanPorts: [{
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }],
  model: 'R310',
  useVenueSettings: false
}

export const initLanData = [{
  type: 'TRUNK',
  untagId: 1,
  vlanMembers: '1-4094',
  portId: '1',
  enabled: true
}]

export const selectedSinglePortModelCaps = {
  canSupportPoeMode: false,
  canSupportPoeOut: false,
  model: 'R310',
  lanPorts: [{
    defaultType: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }]
}

export const mockedApModelFamilies = [
  {
    name: 'AC_WAVE1',
    displayName: '11ac wave 1',
    apModels: [
      'R600',
      'R500',
      'R310',
      'R730',
      'T300',
      'T300E',
      'T301N',
      'T301S'
    ]
  },
  {
    name: 'AC_WAVE2',
    displayName: '11ac wave 2',
    apModels: [
      'R720',
      'R710',
      'R610',
      'R510',
      'R320',
      'M510',
      'H510',
      'H320',
      'E510',
      'T710',
      'T710S',
      'T610',
      'T610S',
      'T310C',
      'T310D',
      'T310N',
      'T310S'
    ]
  },
  {
    name: 'WIFI_6',
    displayName: 'Wi-Fi 6',
    apModels: [
      'R850',
      'R750',
      'R650',
      'R550',
      'R350',
      'H550',
      'H350',
      'T750',
      'T750SE',
      'T350C',
      'T350D',
      'T350SE'
    ]
  },
  {
    name: 'WIFI_6E',
    displayName: 'Wi-Fi 6e',
    apModels: [
      'R560',
      'R760'
    ]
  },
  {
    name: 'WIFI_7',
    displayName: 'Wi-Fi 7',
    apModels: [
      'R770',
      'R670',
      'T670',
      'T670SN',
      'H670'
    ]
  }
]