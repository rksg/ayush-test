import { ApiInfo } from '@acx-ui/utils'

export const NewPersonaBaseUrl = '/identityGroups'

export const PersonaBaseUrl = '/api/identityGroups'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type PersonaUrlType =
  'addPersonaGroup' | 'searchPersonaGroupList' | 'getPersonaGroupById' |
  'updatePersonaGroup' | 'deletePersonaGroup' | 'addPersona' | 'getPersonaById' |
  'searchPersonaList' | 'updatePersona' | 'deletePersona' |
  'addPersonaDevices' | 'deletePersonaDevices' | 'importPersonas' | 'exportPersona' |
  'exportPersonaGroup' | 'deletePersonas' | 'allocateVni' | 'associateMacRegistration' |
  'associateDpskPool' | 'associatePolicySet' | 'dissociatePolicySet' |
  'searchIdentityClients' | 'searchExternalIdentities'

export const PersonaUrls: { [key in PersonaUrlType]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: NewPersonaBaseUrl,
    opsApi: `POST:${NewPersonaBaseUrl}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  associateDpskPool: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/dpskPools/:poolId`,
    opsApi: `PUT:${NewPersonaBaseUrl}/{id}/dpskPools/{id}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  associateMacRegistration: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/macRegistrationPools/:poolId`,
    opsApi: `PUT:${NewPersonaBaseUrl}/{id}/macRegistrationPools/{id}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  associatePolicySet: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/policySets/:policySetId`,
    opsApi: `PUT:${NewPersonaBaseUrl}/{id}/policySets/{id}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  dissociatePolicySet: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/policySets/:policySetId`,
    opsApi: `DELETE:${NewPersonaBaseUrl}/{id}/policySets/{id}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  searchPersonaGroupList: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/query${paginationParams}`,
    opsApi: `POST:${NewPersonaBaseUrl}/query`,
    oldUrl: `${PersonaBaseUrl}/query${paginationParams}`,
    newApi: true
  },
  exportPersonaGroup: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    opsApi: `POST:${NewPersonaBaseUrl}/csvFile`,
    oldUrl: `${PersonaBaseUrl}/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  getPersonaGroupById: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId`,
    opsApi: `GET:${NewPersonaBaseUrl}/{id}`,
    oldUrl: `${PersonaBaseUrl}/:groupId`,
    newApi: true
  },
  updatePersonaGroup: {
    method: 'PATCH',
    url: `${NewPersonaBaseUrl}/:groupId`,
    oldUrl: `${PersonaBaseUrl}/:groupId`,
    opsApi: `PATCH:${NewPersonaBaseUrl}/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deletePersonaGroup: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId`,
    opsApi: `DELETE:${NewPersonaBaseUrl}/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  /** Persona API endpoints */
  addPersona: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/identities`,
    opsApi: `POST:${NewPersonaBaseUrl}/{id}/identities`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getPersonaById: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id`,
    opsApi: `GET:${NewPersonaBaseUrl}/{id}/identities/{id}`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/:id`,
    newApi: true
  },
  searchPersonaList: {
    method: 'post',
    url: `/identities/query${paginationParams}`,
    opsApi: 'POST:/identities/query',
    oldUrl: `/identities/query${paginationParams}`,
    newApi: true
  },
  importPersonas: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/identities/csvFile`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/csvFile`,
    opsApi: `POST:${NewPersonaBaseUrl}/{id}/identities/csvFile`,
    newApi: true
  },
  exportPersona: {
    method: 'post',
    url: `/identities/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    opsApi: 'POST:/identities/csvFile',
    oldUrl: `/identities/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  updatePersona: {
    method: 'PATCH',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id`,
    opsApi: `PATCH:${NewPersonaBaseUrl}/{id}/identities/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deletePersona: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/:id`,
    opsApi: `DELETE:${NewPersonaBaseUrl}/{id}/identities/{id}`,
    newApi: true
  },
  deletePersonas: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities`,
    opsApi: `DELETE:${NewPersonaBaseUrl}/{id}/identities`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addPersonaDevices: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id/devices`,
    opsApi: `POST:${NewPersonaBaseUrl}/{id}/identities/{id}/devices`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deletePersonaDevices: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id/devices/:macAddress`,
    opsApi: `DELETE:${NewPersonaBaseUrl}/{id}/identities/{id}/devices/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  allocateVni: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id/vnis`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/:id/vnis`,
    opsApi: 'DELETE:/identityGroups/{id}/identities/{id}/vnis',
    newApi: true
  },
  searchIdentityClients: {
    method: 'post',
    url: `/identities/clients/query${paginationParams}`,
    opsApi: 'POST:/identities/clients/query',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  searchExternalIdentities: {
    method: 'post',
    url: `/externalIdentities/query${paginationParams}`,
    opsApi: 'POST:/externalIdentities/query',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  }
}
