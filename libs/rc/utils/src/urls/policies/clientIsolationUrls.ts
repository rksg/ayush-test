import { ApiInfo } from '../../apiService'

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
  deleteClientIsolation: {
    method: 'delete',
    url: '/isolationAllowlists/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId',
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
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/isolationAllowlists/query'
  },
  getVenueUsageByClientIsolation: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId/venues/query'
  },
  getEnhancedClientIsolationList: {
    method: 'post',
    url: '/enhancedIsolationAllowlists/query'
  }
}
