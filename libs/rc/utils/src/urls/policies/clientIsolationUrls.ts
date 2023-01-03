import { ApiInfo } from '../../apiService'

export const ClientIsolationUrls: { [key: string]: ApiInfo } = {
  addClientIsolation: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles'
  },
  updateClientIsolation: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  },
  getClientIsolation: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  },
  getClientIsolationList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles'
  },
  deleteClientIsolation: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/clientIsolationPolicyProfiles/:policyId'
  }
}
