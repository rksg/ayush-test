import { ApiInfo } from '../apiService'

export const PersonaUrls: { [key: string]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: '/personaGroups'
  },
  getPersonaGroupList: {
    method: 'get',
    url: '/personaGroups'
  },
  searchPersonaGroupList: {
    method: 'post',
    url: '/personaGroups/search'
  },
  getPersonaGroupById: {
    method: 'get',
    url: '/personaGroups/:groupId'
  },
  updatePersonaGroup: {
    method: 'PATCH',
    url: '/personaGroups/:groupId'
  },
  deletePersonaGroup: {
    method: 'delete',
    url: '/personaGroups/:groupId'
  },
  /** Persona API endpoints */
  addPersona: {
    method: 'post',
    url: '/personaGroups/:groupId/personas'
  },
  getPersonaList: {
    method: 'get',
    url: '/personaGroups/all/personas'
  },
  getPersonaById: {
    method: 'get',
    url: '/personaGroups/:groupId/personas/:id'
  },
  listPersonaByGroupId: {
    method: 'get',
    url: '/personaGroups/:groupId/personas'
  },
  searchPersonaList: {
    method: 'post',
    url: '/personas/search'
  },
  updatePersona: {
    method: 'PATCH',
    url: '/personaGroups/:groupId/personas/:id'
  },
  deletePersona: {
    method: 'delete',
    url: '/personaGroups/:groupId/personas/:id'
  },
  addPersonaDevices: {
    method: 'post',
    url: '/personaGroups/:groupId/personas/:id/devices'
  },
  deletePersonaDevices: {
    method: 'delete',
    url: '/personaGroups/:groupId/personas/:id/devices/:macAddress'
  }
}
