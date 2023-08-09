import moment from 'moment-timezone'

import {
  DpskSaveData,
  MacRegistrationPool,
  NewTablePageable,
  NewTableResult,
  PassphraseFormatEnum,
  Persona,
  PersonaGroup,
  PropertyConfigs,
  PropertyConfigStatus,
  ConnectionMetering,
  BillingCycleType,
  DPSKDeviceInfo
} from '@acx-ui/rc/utils'

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

const defaultPageable: NewTablePageable = {
  offset: 0,
  pageNumber: 0,
  pageSize: 10,
  paged: true,
  sort: {
    unsorted: true,
    sorted: false,
    empty: false
  },
  unpaged: false
}

export const mockUnBlockedPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'group-id-1',
  revoked: false
}

export const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  identityId: 'unit-id-1',
  revoked: false,
  devices: [
    {
      macAddress: '11-11-11-11-11-11',
      personaId: 'persona-id-1',
      hasMacRegistered: true
    },
    {
      macAddress: '11-11-11-11-11-12',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11-11-11-11-11-13',
      personaId: 'persona-id-1'
    }
  ],
  ethernetPorts: [
    {
      portIndex: 1,
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1',
      name: 'port-name-1'
    }
  ],
  meteringProfileId: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  expirationDate: moment().add(-8, 'days').toISOString()
}

export const mockPersonaGroup: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  nsgId: 'nsgId-700',
  propertyId: 'propertyId-100'
}


export const mockPersonaTableResult: NewTableResult<Persona> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalPages: 1,
  totalElements: 3,
  content: [
    {
      id: 'persona-id-1',
      name: 'persona-name-1',
      groupId: 'persona-group-id-1',
      meteringProfileId: null,
      expirationEpoch: null,
      revoked: false
    },
    {
      id: 'persona-id-2',
      name: 'persona-name-2',
      groupId: 'persona-group-id-1',
      meteringProfileId: null,
      expirationEpoch: null,
      revoked: false
    },
    {
      id: 'persona-id-3',
      name: 'persona-name-3',
      groupId: 'persona-group-id-1',
      identityId: 'persona-identity-id-1',
      meteringProfileId: null,
      expirationEpoch: null,
      revoked: false
    }
  ]
}

export const mockPersonaGroupList: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'persona-group-id-1',
      name: 'persona-group-name-1'
    }
  ]
}

export const mockPersonaGroupTableResult: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 3,
  totalPages: 1,
  content: [{
    id: 'persona-group-id-1',
    name: 'Class A',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-2',
    nsgId: 'nsgId-700',
    propertyId: 'propertyId-100'
  },
  {
    id: 'cccccccc',
    name: 'Class B',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-300',
    propertyId: 'propertyId-400'
  },
  {
    id: 'bbbbbbbb',
    name: 'Class C',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1'
  }]
}


export const mockMacRegistration: MacRegistrationPool =
  {
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    enabled: true,
    expirationEnabled: true,
    policySetId: 'string',
    expirationOffset: 1,
    expirationDate: 'string',
    defaultAccess: 'string',
    registrationCount: 0
  }

export const mockMacRegistrationList: NewTableResult<MacRegistrationPool> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [{
    id: 'mac-id-1',
    name: 'mac-name-1',
    autoCleanup: true,
    enabled: true,
    expirationEnabled: true,
    policySetId: 'string',
    expirationOffset: 1,
    expirationDate: 'string',
    defaultAccess: 'string',
    registrationCount: 0
  }]
}

export const mockDpskPool: DpskSaveData = {
  name: 'dpsk-pook-1',
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  passphraseLength: 0,
  expirationType: null
}

export const mockDpskList = {
  content: [
    {
      id: 'dpsk-pool-1',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expirationType: null
    },
    {
      id: '123456789b',
      name: 'DPSK Service 2',
      passphraseLength: 22,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationDate: '2022-12-07'
    },
    {
      id: '123456789c',
      name: 'DPSK Service 3',
      passphraseLength: 24,
      passphraseFormat: PassphraseFormatEnum.KEYBOARD_FRIENDLY,
      expirationType: null,
      expirationOffset: 2
    }
  ],
  totalElements: 3,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

export const mockedDpskPassphraseDevices: DPSKDeviceInfo[] = [
  {
    mac: '22:22:22:22:22:22',
    online: true,
    lastConnected: '06/15/2023 03:24 AM',
    lastConnectedNetwork: 'test',
    devicePassphrase: 'a%sdfa@gw342r3f'
  }
]

export const mockEnabledPropertyConfig: PropertyConfigs = {
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'persona-group-id-1'
}

export const mockConnectionMetering: ConnectionMetering = {
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'profile1',
  uploadRate: 12,
  downloadRate: 5,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 1,
  unitCount: 2
}


export const mockConnectionMeterings = [{
  id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
  name: 'profile1',
  uploadRate: 12,
  downloadRate: 5,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: false,
  billingCycleType: 'CYCLE_UNSPECIFIED' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 1,
  unitCount: 2
}, {
  id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
  name: 'profile2',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_MONTHLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'afce7414-1c78-4312-ad5b-ae03f28dbc6c',
  name: 'profile3',
  uploadRate: 0,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: true,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_WEEKLY' as BillingCycleType,
  billingCycleDays: null,
  venueCount: 0,
  unitCount: 0
},
{
  id: 'bfde7414-1c78-4312-ad5b-ae03f18dbc68',
  name: 'profile4',
  uploadRate: 10,
  downloadRate: 10,
  dataCapacity: 100,
  dataCapacityEnforced: false,
  dataCapacityThreshold: 10,
  billingCycleRepeat: true,
  billingCycleType: 'CYCLE_NUMS_DAY' as BillingCycleType,
  billingCycleDays: 7,
  venueCount: 1,
  unitCount: 1
}
]

export const mockConnectionMeteringTable : NewTableResult<ConnectionMetering> = {
  content: mockConnectionMeterings,
  pageable: defaultPageable,
  totalPages: 1,
  totalElements: 4,
  sort: defaultPageable.sort
}
