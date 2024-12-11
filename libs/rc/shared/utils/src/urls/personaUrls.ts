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
  'associateDpskPool' | 'associatePolicySet' | 'dissociatePolicySet'

export const PersonaUrls: { [key in PersonaUrlType]: ApiInfo } = {
  /** Persona Group API endpoints */
  addPersonaGroup: {
    method: 'post',
    url: NewPersonaBaseUrl,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  associateDpskPool: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/dpskPools/:poolId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  associateMacRegistration: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/macRegistrationPools/:poolId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  associatePolicySet: {
    method: 'put',
    url: `${NewPersonaBaseUrl}/:groupId/policySets/:policySetId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  dissociatePolicySet: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/policySets/:policySetId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  searchPersonaGroupList: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/query${paginationParams}`,
    oldUrl: `${PersonaBaseUrl}/query${paginationParams}`,
    newApi: true
  },
  exportPersonaGroup: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    oldUrl: `${PersonaBaseUrl}/csvFile${paginationParams}`
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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deletePersonaGroup: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId`,
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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getPersonaById: {
    method: 'get',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/:id`,
    newApi: true
  },
  searchPersonaList: {
    method: 'post',
    url: `/identities/query${paginationParams}`,
    oldUrl: `/identities/query${paginationParams}`,
    newApi: true
  },
  importPersonas: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/identities/csvFile`,
    oldUrl: `${PersonaBaseUrl}/:groupId/identities/csvFile`,
    newApi: true
  },
  exportPersona: {
    method: 'post',
    url: `/identities/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    oldUrl: `/identities/csvFile${paginationParams}`
      + '&timezone=:timezone&date-format=:dateFormat',
    newApi: true
  },
  updatePersona: {
    method: 'PATCH',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id`,
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
    newApi: true
  },
  deletePersonas: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addPersonaDevices: {
    method: 'post',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id/devices`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deletePersonaDevices: {
    method: 'delete',
    url: `${NewPersonaBaseUrl}/:groupId/identities/:id/devices/:macAddress`,
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
    newApi: true
  }
}
