import { ApiInfo } from '../../apiService'

export const RogueAPDetectionUrls: { [key: string]: ApiInfo } = {
  addRoguePolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/rogue-policy'
  },
  getRoguePolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId'
  },
  updateRoguePolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/rogue-policy/:policyId'
  },
  getRoguePolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles'
  },
  getVenueRoguePolicy: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  }
}
