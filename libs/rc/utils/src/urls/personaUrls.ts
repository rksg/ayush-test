import { ApiInfo } from '../apiService'

export const PersonaBaseUrl = '/api/personaGroups'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

// eslint-disable-next-line max-len
type PersonaUrlType = 'addPersonaGroup' | 'getPersonaGroupList' | 'searchPersonaGroupList' | 'getPersonaGroupById' | 'updatePersonaGroup' | 'deletePersonaGroup' | 'addPersona' | 'getPersonaList' | 'getPersonaById' | 'listPersonaByGroupId' | 'searchPersonaList' | 'updatePersona' | 'deletePersona' | 'addPersonaDevices' | 'deletePersonaDevices' | 'importPersonas' | 'exportPersona' | 'exportPersonaGroup' | 'deletePersonas'

export const PersonaUrls: { [key in PersonaUrlType]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: PersonaBaseUrl
  },
  getPersonaGroupList: {
    method: 'get',
    url: PersonaBaseUrl + paginationParams
  },
  searchPersonaGroupList: {
    method: 'post',
    url: `${PersonaBaseUrl}/search${paginationParams}`
  },
  exportPersonaGroup: {
    method: 'post',
    url: `${PersonaBaseUrl}/search?timezone=:timezone&date-format=:dateFormat`
  },
  getPersonaGroupById: {
    method: 'get',
    url: `${PersonaBaseUrl}/:groupId`
  },
  updatePersonaGroup: {
    method: 'PATCH',
    url: `${PersonaBaseUrl}/:groupId`
  },
  deletePersonaGroup: {
    method: 'delete',
    url: `${PersonaBaseUrl}/:groupId`
  },
  /** Persona API endpoints */
  addPersona: {
    method: 'post',
    url: `${PersonaBaseUrl}/:groupId/personas`
  },
  getPersonaList: {
    method: 'get',
    url: `${PersonaBaseUrl}/all/personas`
  },
  getPersonaById: {
    method: 'get',
    url: `${PersonaBaseUrl}/:groupId/personas/:id`
  },
  listPersonaByGroupId: {
    method: 'get',
    url: `${PersonaBaseUrl}/:groupId/personas`
  },
  searchPersonaList: {
    method: 'post',
    url: `${PersonaBaseUrl}/all/personas/search${paginationParams}`
  },
  importPersonas: {
    method: 'post',
    url: `${PersonaBaseUrl}/:groupId/personas`
  },
  exportPersona: {
    method: 'post',
    url: `${PersonaBaseUrl}/all/personas/search?timezone=:timezone&date-format=:dateFormat`
  },
  updatePersona: {
    method: 'PATCH',
    url: `${PersonaBaseUrl}/:groupId/personas/:id`
  },
  deletePersona: {
    method: 'delete',
    url: `${PersonaBaseUrl}/:groupId/personas/:id`
  },
  deletePersonas: {
    method: 'delete',
    url: `${PersonaBaseUrl}/all/personas`
  },
  addPersonaDevices: {
    method: 'post',
    url: `${PersonaBaseUrl}/:groupId/personas/:id/devices`
  },
  deletePersonaDevices: {
    method: 'delete',
    url: `${PersonaBaseUrl}/:groupId/personas/:id/devices/:macAddress`
  }
}
