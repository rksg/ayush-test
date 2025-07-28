import { AAAPolicyType, EthernetPortAuthType, EthernetPortProfile, EthernetPortSupplicantType, EthernetPortType } from '@acx-ui/rc/utils'
import { TableResult }                                                                                            from '@acx-ui/utils'

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
export const mockDefaultTrunkProfileId = 'default_trunk'
export const mockAccountingRadiusId = '__Accounting_Radius_ID_1__'
export const mockAccountingRadiusId2 = '__Accounting_Radius_ID_2__'
export const mockAccuntingRadiusName = '__Accounting_Radius_Name_1__'

export const mockVenueId = '__Venue_ID_1__'
export const mockVenueId2 = '__Venue_ID_2__'
export const mockVenueId3 = '__Venue_ID_3__'

export const mockVenueName = '__Venue_ID_Name_1__'
export const mockVenueName2 = '__Venue_ID_Name_2__'
export const mockVenueName3 = '__Venue_ID_Name_3__'

export const mockApSerialNumber1 = 'mock_AP_Serial_number__'

export const mockApName = 'ap_name_1'

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

export const mockedApsResult = {
  totalCount: 1,
  page: 1,
  data: [{
    serialNumber: mockApSerialNumber1,
    name: mockApName
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
  authType: EthernetPortAuthType.DISABLED,
  description: 'dummy',
  type: EthernetPortType.TRUNK,
  untagId: 1,
  vlanMembers: '1-4094',
  isDefault: false,
  SupplicantAuthenticationOptions: {
    type: EthernetPortSupplicantType.MAC_AUTH
  }
}

export const dummyEthernetPortProfileAccessPortBased = {
  id: mockEthernetPortProfileId3,
  name: mockEthernetPortProfileId3,
  authType: EthernetPortAuthType.PORT_BASED,
  type: EthernetPortType.ACCESS,
  bypassMacAddressAuthentication: true,
  description: undefined,
  enableAccountingProxy: true,
  enableAccountingService: true,
  enableAuthProxy: true,
  accountingRadiusId: mockAccountingRadiusId,
  authRadiusId: mockAuthRadiusId,
  isDefault: false,
  untagId: 1,
  vlanMembers: '1',
  apSerialNumbers: [mockApSerialNumber],
  venueIds: [mockVenueId]
}

export const dummyDefaultEthernetPortProfileTrunk = {
  id: mockDefaultTrunkProfileId,
  name: 'Default Trunk',
  // authType: 'DISABLED',
  authType: EthernetPortAuthType.DISABLED,
  description: 'default trunk',
  // type: 'TRUNK',
  type: EthernetPortType.TRUNK,
  untagId: 1,
  vlanMembers: '1-4094',
  isDefault: true,
  apSerialNumbers: [mockApSerialNumber],
  venueIds: [mockVenueId2]
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

export const dummayRadiusServiceList = {
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
