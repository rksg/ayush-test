import { ApiInfo } from '@acx-ui/utils'

export const ClientIsolationUrls: { [key: string]: ApiInfo } = {
  addClientIsolation: {
    method: 'post',
    url: '/isolationAllowlists',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist',
    newApi: true
  },
  getClientIsolation: {
    method: 'get',
    url: '/isolationAllowlists/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId',
    newApi: true
  },
  updateClientIsolation: {
    method: 'put',
    url: '/isolationAllowlists/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId',
    newApi: true
  },
  deleteClientIsolationList: {
    method: 'delete',
    url: '/isolationAllowlists',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist',
    newApi: true
  },
  getClientIsolationList: {
    method: 'get',
    url: '/isolationAllowlists',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist',
    newApi: true
  },
  getClientIsolationListUsageByVenue: {
    method: 'post',
    url: '/venues/:venueId/isolationAllowlists/query',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/isolationAllowlists/query',
    newApi: true
  },
  getVenueUsageByClientIsolation: {
    method: 'post',
    url: '/isolationAllowlists/:policyId/venues/query',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId/venues/query',
    newApi: true
  },
  getEnhancedClientIsolationList: {
    method: 'post',
    url: '/enhancedIsolationAllowlists/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedIsolationAllowlists/query',
    newApi: true
  },
  addClientIsolationRbac: {
    method: 'post',
    url: '/clientIsolationProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getClientIsolationRbac: {
    method: 'get',
    url: '/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateClientIsolationRbac: {
    method: 'put',
    url: '/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteClientIsolationRbac: {
    method: 'delete',
    url: '/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateClientIsolationOnVenue: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateClientIsolationOnVenue: {
    method: 'delete',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },

  activateClientIsolationOnAp: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateClientIsolationOnAp: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/clientIsolationProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  queryClientIsolation: {
    method: 'post',
    url: '/clientIsolationProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
