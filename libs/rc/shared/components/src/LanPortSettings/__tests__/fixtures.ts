export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAuthRadiusId2 = '__Auth_Radius_ID_2__'
export const mockAuthRadiusName = '__Auth_Radius_Name__'
export const mockAuthRadiusName2 = '__Auth_Radius_Name_2__'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockAccuntingRadiusName = '__Accounting_Radius_Name_1__'
export const mockDefaultTrunkEthertnetPortProfileId = 'tenant-id_TRUNK'
export const mockDefaultAccessEthertnetPortProfileId = 'tenant-id_ACCESS'
export const mockTrunkEthertnetPortProfileId1 = 'mockTrunkEthertnetPortProfileId1'
export const mockAccessEthertnetPortProfileId1 = 'mockAccessEthertnetPortProfileId1'
export const trunkWithPortBasedName = 'Trunk with Port Based'
export const clientIsolationProfileId = '__Client_Isolation_Profile_ID__'
export const clientIsolationProfileId2 = '__Client_Isolation_Profile_ID_2__'
export const clientIsolationProfileId3 = '__Client_Isolation_Profile_ID_3__'
export const clientIsolationProfileName = '__Client_Isolation_Profile_Name__'
export const clientIsolationProfileName2 = '__Client_Isolation_Profile_Name_2__'
export const clientIsolationProfileName3 = '__Client_Isolation_Profile_Name_3__'
export const clientIsolationProfileDescription = '__Client_Isolation_Profile_Description__'


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
    id: mockDefaultAccessEthertnetPortProfileId,
    tenantId: 'tenant-id',
    name: 'Default Access',
    type: 'ACCESS',
    untagId: 1,
    vlanMembers: '1',
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
    apSerialNumbers: [],
    apActivations: []
  },
  {
    id: mockAccessEthertnetPortProfileId1,
    tenantId: 'tenant-id',
    name: 'trunk Profile 1',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1',
    isDefault: false,
    authType: 'DISABLED',
    apSerialNumbers: [
      '123456789042'
    ],
    apActivations: [
      {
        venueId: '123',
        apSerialNumber: '123456789042',
        portId: 1
      }
    ]
  },
  {
    id: 'mockEthertnetPortProfileId1',
    tenantId: 'tenant-id',
    name: 'Hidden profile',
    type: 'ACCESS',
    untagId: 1,
    vlanMembers: '1',
    authType: 'DISABLED',
    isDefault: false,
    vni: 123
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
  allowDfsCountry: 'SG,US',
  canSupportCellular: false,
  canSupportLacp: false,
  capabilityScore: 288,
  has160MHzChannelBandwidth: false,
  isOutdoor: false,
  requireOneEnabledTrunkPort: false,
  supportChannel144: true,
  supportDual5gMode: false,
  lanPortPictureDownloadUrl: '',
  ledOn: false,
  lldpAdInterval: 0,
  lldpEnable: false,
  model: 'R310',
  lanPorts: [{
    defaultType: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true,
    id: '1'
  }]
}

export const portOverwrite = {
  enabled: true,
  overwriteUntagId: 1,
  overwriteVlanMembers: '1-4094'
}
export const selectedApModel = {
  lanPorts: [{
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }],
  model: 'R370',
  useVenueSettings: false
}
export const selectedApModelCaps = {
  canSupportPoeMode: false,
  canSupportPoeOut: false,
  model: 'R370',
  lanPorts: [{
    defaultType: 'TRUNK',
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true,
    id: '1'
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

export const mockedClientIsolationProfile = {
  id: clientIsolationProfileId,
  name: clientIsolationProfileName,
  description: clientIsolationProfileDescription,
  allowlist: [
    {
      mac: 'AA:BB:CC:DD:EE:11',
      description: 'Client 1'
    },
    {
      mac: 'AA:BB:CC:DD:EE:22',
      description: 'Client 2'
    },
    {
      mac: 'AA:BB:CC:DD:EE:33',
      description: 'Client 3'
    }
  ]
}

export const mockedClientIsolationProfile2 = {
  id: clientIsolationProfileId2,
  name: clientIsolationProfileName2,
  description: 'Here is the description 2',
  allowlist: [
    {
      mac: '22:BB:CC:DD:EE:11',
      description: 'Client 2-1'
    },
    {
      mac: '22:BB:CC:DD:EE:22',
      description: 'Client 2-2'
    }
  ]
}

export const mockedClientIsolationProfile3 = {
  id: clientIsolationProfileId3,
  name: clientIsolationProfileName3,
  description: 'Here is the description 3',
  allowlist: [
    {
      mac: 'AA:BB:CC:DD:EE:11',
      description: 'Client 3-1'
    }
  ]
}

export const mockedClientIsolationList = [
  mockedClientIsolationProfile,
  mockedClientIsolationProfile2,
  mockedClientIsolationProfile3
]
