import { ApiInfo } from '../../apiService'

export const ClientIsolationUrls: { [key: string]: ApiInfo } = {
  addClientIsolation: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles'
  },
  getClientIsolation: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  },
  updateClientIsolation: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  },
  deleteClientIsolation: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  },
  getClientIsolationList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles'
  }
}
