import {
  AlgorithmType,
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

export const mockPersonaGroupTableResult: NewTableResult<PersonaGroup> = {
  pageable: defaultPageable,
  sort: defaultPageable.sort,
  totalElements: 3,
  totalPages: 1,
  content: [{
    id: 'b5aac889-f99a-4254-b96a-1924b9227f5e',
    name: 'PersonaGroup_4885',
    dpskPoolId: '1567726a-1046-41bf-ab06-c56fceb20a3b',
    description: 'Description 45',
    personalIdentityNetworkId: '856ae0a2-49eb-45be-bb2c-e72634fcac4f',
    createdAt: '2024-08-02T08:48:33.158904',
    identityCount: 7
  },
  {
    id: 'a94ccdad-a18c-4888-896c-1183528f38fa',
    name: 'PersonaGroup_7458',
    description: 'Description 73',
    tenantId: 'b2c1f9c9-ef39-491d-b6af-93ed8c9dd796',
    macRegistrationPoolId: '256c821d-6a7b-4aed-9898-a0d55c838059',
    dpskPoolId: '1567726a-1046-41bf-ab06-c56fceb20a3b',
    createdAt: '2024-08-02T08:48:33.159311',
    updatedAt: '2024-08-02T08:48:33.159319'
  }
  ,
  {
    id: 'bbbbbbbb',
    name: 'Class C',
    description: '',
    macRegistrationPoolId: 'mac-id-1',
    dpskPoolId: 'dpsk-pool-1'
  }]
}

export const mockPersonaGroupById: PersonaGroup = {
  id: 'identity-group-id-for-testing',
  name: 'PersonaGroup_4885',
  dpskPoolId: '1567726a-1046-41bf-ab06-c56fceb20a3b',
  description: 'Description 45',
  personalIdentityNetworkId: '856ae0a2-49eb-45be-bb2c-e72634fcac4f',
  createdAt: '2024-08-02T08:48:33.158904',
  identityCount: 7
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
      meteringProfileId: undefined,
      expirationEpoch: null,
      revoked: false
    },
    {
      id: 'persona-id-2',
      name: 'persona-name-2',
      groupId: 'persona-group-id-1',
      meteringProfileId: undefined,
      expirationEpoch: null,
      revoked: false
    },
    {
      id: 'persona-id-3',
      name: 'persona-name-3',
      groupId: 'persona-group-id-1',
      identityId: 'persona-identity-id-1',
      meteringProfileId: undefined,
      expirationEpoch: null,
      revoked: false
    }
  ]
}

export const mockMacRegList: MacRegistrationPool = {
  id: 'mac-list-1',
  name: 'mac-list-1',
  networkIds: [
    'c9d5f4c771c34ad2898f7078cebbb191'
  ],
  autoCleanup: false,
  enabled: false,
  registrationCount: 0,
  defaultAccess: ''
}

export const mockDpskPool: DpskSaveData = {
  id: 'dpsk-pool-1',
  name: 'dpsk-pool-1',
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  passphraseLength: 0,
  expirationType: null,
  networkIds: [
    'c9d5f4c771c34ad2898f7078cebbb191'
  ]
}

export const mockedNetworkList = {
  totalCount: 10,
  page: 1,
  data: [
    {
      aps: 1,
      clients: 0,
      id: 'c9d5f4c771c34ad2898f7078cebbb191',
      name: 'network-01',
      nwSubType: 'psk',
      ssid: 'ssid-01',
      venues: { count: 3, names: ['pingtung', 'My-Venue', '101'] },
      count: 3,
      names: ['pingtung', 'My-Venue', '101'],
      vlan: 1,
      deepNetwork: {
        wlan: {
          wlanSecurity: 'WPA3'
        }
      }
    },
    {
      aps: 0,
      captiveType: 'ClickThrough',
      clients: 0,
      id: 'ad850ca8595d4f2f9e7f208664cd8798',
      name: 'network-02',
      nwSubType: 'guest',
      ssid: '02',
      venues: { count: 0, names: [] },
      vlan: 1
    }
  ]
}

export const mockCertificateTemplates = {
  fields: null,
  totalCount: 2,
  totalPages: 1,
  page: 1,
  data: [
    {
      id: 'cert-template-id-for-testing',
      description: 'cert-template-id-for-testing',
      name: 'cert-template-id-for-testing',
      networkIds: ['65d2f63d-b773-45f6-b81d-a2cb832e3841', '65d2f63d-b773-45f6-b81d-a2cb832e3811'],
      identityGroupId: 'identity-group-id-for-testing',
      caType: '',
      keyLength: 0,
      algorithm: AlgorithmType.SHA_256
    },
    {
      id: 'cert-template-id-for-testing1',
      description: 'cert-template-id-for-testing1',
      name: 'cert-template-id-for-testing1',
      networkIds: ['65d2f63d-b773-45f6-b81d-a2cb832e3843', '65d2f63d-b773-45f6-b81d-a2cb832e3818'],
      identityGroupId: 'identity-group-id-for-testing1',
      caType: '',
      keyLength: 0,
      algorithm: AlgorithmType.SHA_256
    }]
}

