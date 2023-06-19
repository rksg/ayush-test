import { ApiInfo } from '@acx-ui/utils'

export const NewPersonaBaseUrl = '/personaGroups'

export const PersonaBaseUrl = '/api/personaGroups'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type PersonaUrlType =
  'addPersonaGroup' | 'getPersonaGroupList' | 'searchPersonaGroupList' | 'getPersonaGroupById' |
  'updatePersonaGroup' | 'deletePersonaGroup' | 'addPersona' | 'getPersonaList' | 'getPersonaById' |
  'listPersonaByGroupId' | 'searchPersonaList' | 'updatePersona' | 'deletePersona' |
  'addPersonaDevices' | 'deletePersonaDevices' | 'importPersonas' | 'exportPersona' |
  'exportPersonaGroup' | 'deletePersonas' | 'allocateVni'

export const PersonaUrls: { [key in PersonaUrlType]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: NewPersonaBaseUrl,
    oldUrl: PersonaBaseUrl,
    newApi: true
  },
  getPersonaGroupList: {
    method: 'get',
    url: NewPersonaBaseUrl + paginationParams,
    oldUrl: PersonaBaseUrl + paginationParams,
    newApi: true
  },
  searchPersonaGroupList: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/search${paginationParams}`,
    oldUrl: `${PersonaBaseUrl}/search${paginationParams}`,
    newApi: true
  },
  exportPersonaGroup: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/search${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    oldUrl: `${PersonaBaseUrl}/search${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  getPersonaGroupById: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId`,
    oldUrl: `${PersonaBaseUrl}/:groupId`,
    newApi: true
  },
  updatePersonaGroup: {
    method: 'PATCH',
    url: `${NewPersonaBaseUrl}/:groupId`,
    oldUrl: `${PersonaBaseUrl}/:groupId`,
    newApi: true
  },
  deletePersonaGroup: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId`,
    oldUrl: `${PersonaBaseUrl}/:groupId`,
    newApi: true
  },
  /** Persona API endpoints */
  addPersona: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/personas`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas`,
    newApi: true
  },
  getPersonaList: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/all/personas`,
    oldUrl: `${PersonaBaseUrl}/all/personas`,
    newApi: true
  },
  getPersonaById: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id`,
    newApi: true
  },
  listPersonaByGroupId: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId/personas`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas`,
    newApi: true
  },
  searchPersonaList: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/all/personas/search${paginationParams}`,
    oldUrl: `${PersonaBaseUrl}/all/personas/search${paginationParams}`,
    newApi: true
  },
  importPersonas: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/personas`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas`,
    newApi: true
  },
  exportPersona: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/all/personas/search${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    oldUrl: `${PersonaBaseUrl}/all/personas/search${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  updatePersona: {
    method: 'PATCH',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id`,
    newApi: true
  },
  deletePersona: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id`,
    newApi: true
  },
  deletePersonas: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/all/personas`,
    oldUrl: `${PersonaBaseUrl}/all/personas`,
    newApi: true
  },
  addPersonaDevices: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id/devices`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id/devices`,
    newApi: true
  },
  deletePersonaDevices: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id/devices/:macAddress`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id/devices/:macAddress`,
    newApi: true
  },
  allocateVni: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/personas/:id/vnis`,
    oldUrl: `${PersonaBaseUrl}/:groupId/personas/:id/vnis`,
    newApi: true
  }
}
