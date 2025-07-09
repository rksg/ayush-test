import {
  MacRegistrationPool,
  MessageType,
  PassphraseFormatEnum,
  PersonaGroup,
  PropertyConfigStatus,
  PropertyConfigs,
  PropertyUnit,
  PropertyUnitStatus,
  ResidentPortal,
  TemplateScope,
  Template
} from '@acx-ui/rc/utils'
import { NewTableResult, NewTablePageable } from '@acx-ui/utils'

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

export const mockPersonaGroup: PersonaGroup = {
  id: 'persona-group-id-1',
  name: 'Class A',
  description: '',
  macRegistrationPoolId: 'mac-id-1',
  dpskPoolId: 'dpsk-pool-2',
  personalIdentityNetworkId: 'nsgId-700',
  propertyId: 'propertyId-100'
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

const paginationPattern = '?size=:pageSize&page=:page&sort=:sort'
export const replacePagination = (url: string) => url.replace(paginationPattern, '')

export const mockedTemplateScope: TemplateScope = {
  id: '648269aa-23c7-41da-baa4-811e92d89ed1',
  messageType: MessageType.EMAIL,
  nameLocalizationKey: 'unit.assigned.email',
  defaultTemplateId: '746ac7b2-1ec5-412c-9354-e5ac274b7bd9'
}

export const mockAllTemplates: NewTableResult<Template> = {
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  pageable: defaultPageable,
  content: []
}

export const mockResidentPortalProfileList: NewTableResult<ResidentPortal> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'resident-portal-profile-id-1',
      name: 'resident-portal-profile-name-1'
    }
  ]
}

export const mockEnabledNoPinPropertyConfig: PropertyConfigs = {
  status: PropertyConfigStatus.ENABLED,
  personaGroupId: 'persona-group-id-noNSG',
  residentPortalId: mockResidentPortalProfileList.content[0].id,
  unitConfig: {
    type: 'unitConfig',
    guestAllowed: true,
    residentPortalAllowed: true,
    residentApiAllowed: false,
    useMaxUnitCount: false,
    maxUnitCount: 1
  }
}

export const mockPropertyUnitList: NewTableResult<PropertyUnit> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 1,
  totalPages: 1,
  content: [
    {
      id: 'unit-id-1',
      name: 'unit-1',
      status: PropertyUnitStatus.ENABLED,
      dpsks: [],
      personaId: 'persona-1',
      vni: 0
    }
  ]
}
