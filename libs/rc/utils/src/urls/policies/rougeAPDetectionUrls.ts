import { ApiInfo } from '../../apiService'

export const RougeAPDetectionUrls: { [key: string]: ApiInfo } = {
  addRougePolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/rouge-policy'
  },
  getRougePolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogue-policy/:policyId'
  },
  getRougePolicyList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/rogue/policy'
  }
}
