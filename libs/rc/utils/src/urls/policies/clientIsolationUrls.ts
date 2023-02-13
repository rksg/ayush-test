import { ApiInfo } from '../../apiService'

export const ClientIsolationUrls: { [key: string]: ApiInfo } = {
  addClientIsolation: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist'
  },
  getClientIsolation: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId'
  },
  updateClientIsolation: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId'
  },
  deleteClientIsolation: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId'
  },
  getClientIsolationList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist'
  },
  getClientIsolationListUsageByVenue: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/isolationAllowlists/query'
  },
  getVenueUsageByClientIsolation: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/isolation-allowlist/:policyId/venues/query'
  }
}
