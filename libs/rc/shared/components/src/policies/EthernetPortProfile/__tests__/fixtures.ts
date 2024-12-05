import { AAAPolicyType, EthernetPortAuthType, EthernetPortProfile, EthernetPortSupplicantType, EthernetPortType, TableResult } from '@acx-ui/rc/utils'

export const mockedTenantId = '__Tenant_ID__'
export const mockedPolicyId = '__Policy_ID__'
export const mockAuthRadiusId = '__Auth_Radius_ID__'
export const mockAuthRadiusId2 = '__Auth_Radius_ID_2__'
export const mockAuthRadiusName = '__Auth_Radius_Name__'
export const mockAuthRadiusName2 = '__Auth_Radius_Name_2__'
export const mockEthernetPortProfilePrefix = 'ethernetPortProfile_'
export const mockEthernetPortProfileId = mockEthernetPortProfilePrefix + '1'
export const mockEthernetPortProfileId2 = mockEthernetPortProfilePrefix + '2'
export const mockEthernetPortProfileId3 = mockEthernetPortProfilePrefix + '3'
export const mockEthernetPortProfileId4 = mockEthernetPortProfilePrefix + '4'
export const mockEthernetPortProfileId5 = mockEthernetPortProfilePrefix + '5'
export const mockEthernetPortProfileId6 = mockEthernetPortProfilePrefix + '6'
export const mockEthernetPortProfileId7 = mockEthernetPortProfilePrefix + '7'
export const mockDefaultTrunkProfileId = 'default_trunk'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockAccuntingRadiusName = '__Accounting_Radius_Name_1__'
export const mockAuthRadSecRadiusId = '__Auth_RadSec_Radius_ID__'
export const mockAuthRadSecRadiusName = '__AuthRadSec__Radius_Name__'
export const mockAccountingRadSecRadiusId = '__Accounting_RadSec_Radius_ID__'
export const mockAccountingRadSecRadiusName = '__Accounting_RadSec_Radius_Name__'


export const mockVenueId = '__Venue_ID_1__'
export const mockVenueId2 = '__Venue_ID_2__'
export const mockVenueId3 = '__Venue_ID_3__'

export const mockVenueName = '__Venue_ID_Name_1__'
export const mockVenueName2 = '__Venue_ID_Name_2__'
export const mockVenueName3 = '__Venue_ID_Name_3__'

export const mockApSerialNumber = 'mock_AP_Serial_number__'

export const mockedVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: mockVenueId,
    name: mockVenueName
  },{
    id: mockVenueId2,
    name: mockVenueName2
  },{
    id: mockVenueId3,
    name: mockVenueName3
  }]
}

export const mockedVenueApsList = {
  totalCount: 1,
  page: 1,
  data: [{
    model: 'R550',
    name: 'AP1',
    serialNumber: mockApSerialNumber,
    venueId: mockVenueId,
    venueName: mockVenueName
  }]
}

export const mockVenueActivations = [
  {
    venueId: mockVenueId,
    portId: 1,
    apModel: 'R550'
  }
]

export const dummyAuthRadius: AAAPolicyType = {
  id: mockAuthRadiusId,
  name: mockAuthRadiusName,
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

export const dummyAccounting: AAAPolicyType = {
  id: mockAccountingRadiusId,
  name: mockAccuntingRadiusName,
  primary: {
    ip: '192.168.0.201',
    port: 1813,
    sharedSecret: '11111'
  },
  type: 'ACCOUNTING'
}

export const dummyAuthRadSecRadius: AAAPolicyType = {
  id: mockAuthRadSecRadiusId,
  name: mockAuthRadSecRadiusName,
  primary: {
    ip: '192.168.1.100',
    port: 2083
  },
  type: 'AUTHENTICATION',
  radSecOptions: {
    tlsEnabled: true,
    certificateAuthorityId: '2ce780df-fd3f-4b22-b9d0-deefed397410'
  }
}

export const dummyAccountingRadSecRadius: AAAPolicyType = {
  id: mockAccountingRadSecRadiusId,
  name: mockAccountingRadSecRadiusName,
  primary: {
    ip: '192.168.1.101',
    port: 2083
  },
  type: 'ACCOUNTING',
  radSecOptions: {
    tlsEnabled: true,
    certificateAuthorityId: '2ce780df-fd3f-4b22-b9d0-deefed397410'
  }
}

export const dummyRadiusServiceList = {
  totalCount: 5,
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
  }, {
    id: mockAuthRadSecRadiusId,
    name: mockAuthRadSecRadiusName,
    type: 'AUTHENTICATION',
    primary: '192.168.1.100:2083',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9',
    radSecOptions: {
      tlsEnabled: true,
      certificateAuthorityId: '2ce780df-fd3f-4b22-b9d0-deefed397410'
    }
  }, {
    id: mockAccountingRadSecRadiusId,
    name: mockAccountingRadSecRadiusName,
    type: 'ACCOUNTING',
    primary: '192.168.1.101:2083',
    networkCount: 0,
    networkIds: [],
    tenantId: '83a98239787940188137242bdf6795e9',
    radSecOptions: {
      tlsEnabled: true,
      certificateAuthorityId: '2ce780df-fd3f-4b22-b9d0-deefed397410'
    }
  }]
}

export const dummyRadiusServiceByEthernetList = {
  totalCount: 2,
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



export const dummyEthernetPortProfileTrunk = {
  id: mockEthernetPortProfileId,
  name: mockEthernetPortProfileId,
  // authType: 'DISABLED',
  authType: EthernetPortAuthType.DISABLED,
  description: 'dummy',
  type: EthernetPortType.TRUNK,
  untagId: 1,
  vlanMembers: '1-4094',
  isDefault: false,
  apSerialNumbers: [],
  venueIds: [mockVenueId, mockVenueId3]
}

export const dummyEthernetPortProfileTrunkSupplicant = {
  id: mockEthernetPortProfileId2,
  name: mockEthernetPortProfileId2,
  authType: EthernetPortAuthType.SUPPLICANT,
  description: 'dummy',
  type: EthernetPortType.TRUNK,
  untagId: 1,
  vlanMembers: '1-4094',
  isDefault: false,
  supplicantAuthenticationOptions: {
    type: EthernetPortSupplicantType.MAC_AUTH
  }
}

export const dummyEthernetPortProfileAccessPortBased = {
  id: mockEthernetPortProfileId3,
  name: mockEthernetPortProfileId3,
  authType: EthernetPortAuthType.PORT_BASED,
  type: EthernetPortType.ACCESS,
  enableAccountingProxy: true,
  accountingService: true,
  enableAuthProxy: true,
  accountingRadiusId: mockAccountingRadiusId,
  authRadiusId: mockAuthRadiusId,
  isDefault: false,
  untagId: 1,
  vlanMembers: '1',
  apSerialNumbers: [mockApSerialNumber],
  venueIds: [mockVenueId]
}

export const dummyEthernetPortProfileDVlan = {
  id: mockEthernetPortProfileId7,
  name: mockEthernetPortProfileId7,
  type: EthernetPortType.ACCESS,
  authType: EthernetPortAuthType.MAC_BASED,
  untagId: 1,
  vlanMembers: '1',
  isDefault: false,
  enableAuthProxy: false,
  enableAccountingProxy: true,
  bypassMacAddressAuthentication: true,
  dynamicVlanEnabled: true,
  unauthenticatedGuestVlan: 99
}

export const dummyDefaultEthernetPortProfileTrunk = {
  id: mockDefaultTrunkProfileId,
  name: 'Default Trunk',
  authType: EthernetPortAuthType.DISABLED,
  description: 'default trunk',
  type: EthernetPortType.TRUNK,
  untagId: 1,
  vlanMembers: '1-4094',
  isDefault: true,
  apSerialNumbers: [mockApSerialNumber],
  venueIds: [mockVenueId2],
  venueActivations: mockVenueActivations
}

export const dummyEthernetPortProfileAccess = {
  id: mockEthernetPortProfileId6,
  name: mockEthernetPortProfileId6,
  authType: EthernetPortAuthType.DISABLED,
  type: EthernetPortType.ACCESS,
  isDefault: false,
  untagId: 1,
  vlanMembers: '1',
  apSerialNumbers: [mockApSerialNumber],
  venueIds: [mockVenueId]
}

export const dummyTableResult: TableResult<EthernetPortProfile> = {
  totalCount: 4,
  page: 1,
  data: [{
    ...dummyDefaultEthernetPortProfileTrunk
  }, {
    ...dummyEthernetPortProfileTrunk
  }, {
    ...dummyEthernetPortProfileTrunkSupplicant
  }, {
    ...dummyEthernetPortProfileAccessPortBased
  }]
}

export const dummyTableResultWithSingle: TableResult<EthernetPortProfile> = {
  totalCount: 1,
  page: 1,
  data: [{
    ...dummyEthernetPortProfileAccessPortBased
  }]
}