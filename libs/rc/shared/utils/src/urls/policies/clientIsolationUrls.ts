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
  }
}
