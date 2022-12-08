import { ApiInfo } from '../apiService'

const basePersonaUrl = '/api/personaGroups'

export const PersonaUrls: { [key: string]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: basePersonaUrl
  },
  getPersonaGroupList: {
    method: 'get',
    url: basePersonaUrl
  },
  searchPersonaGroupList: {
    method: 'post',
    url: `${basePersonaUrl}/search`
  },
  getPersonaGroupById: {
    method: 'get',
    url: `${basePersonaUrl}/:groupId`
  },
  updatePersonaGroup: {
    method: 'PATCH',
    url: `${basePersonaUrl}/:groupId`
  },
  deletePersonaGroup: {
    method: 'delete',
    url: `${basePersonaUrl}/:groupId`
  },
  /** Persona API endpoints */
  addPersona: {
    method: 'post',
    url: `${basePersonaUrl}/:groupId/personas`
  },
  getPersonaList: {
    method: 'get',
    url: `${basePersonaUrl}/all/personas`
  },
  getPersonaById: {
    method: 'get',
    url: `${basePersonaUrl}/:groupId/personas/:id`
  },
  listPersonaByGroupId: {
    method: 'get',
    url: `${basePersonaUrl}/:groupId/personas`
  },
  searchPersonaList: {
    method: 'post',
    url: `${basePersonaUrl}/all/personas/search`
  },
  updatePersona: {
    method: 'PATCH',
    url: `${basePersonaUrl}/:groupId/personas/:id`
  },
  deletePersona: {
    method: 'delete',
    url: `${basePersonaUrl}/:groupId/personas/:id`
  },
  addPersonaDevices: {
    method: 'post',
    url: `${basePersonaUrl}/:groupId/personas/:id/devices`
  },
  deletePersonaDevices: {
    method: 'delete',
    url: `${basePersonaUrl}/:groupId/personas/:id/devices/:macAddress`
  }
}
