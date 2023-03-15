import {
  DpskSaveData,
  MacRegistrationPool,
  NewTablePageable,
  NewTableResult,
  PassphraseFormatEnum,
  Persona,
  PersonaGroup
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

export const mockPersona: Persona = {
  id: 'persona-id-1',
  name: 'persona-name-1',
  groupId: 'persona-group-id-1',
  dpskGuid: 'dpsk-guid-1',
  dpskPassphrase: 'dpsk-passphrase',
  devices: [
    {
      macAddress: '11:11:11:11:11:11',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:12',
      personaId: 'persona-id-1'
    },
    {
      macAddress: '11:11:11:11:11:13',
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
  ]
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
      groupId: 'persona-group-id-1'
    },
    {
      id: 'persona-id-2',
      name: 'persona-name-2',
      groupId: 'persona-group-id-1'
    },
    {
      id: 'persona-id-3',
      name: 'persona-name-3',
      groupId: 'persona-group-id-1'
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
    dpskPoolId: 'dpsk-pool-1',
    nsgId: 'nsgId-100',
    propertyId: 'propertyId-600'
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
