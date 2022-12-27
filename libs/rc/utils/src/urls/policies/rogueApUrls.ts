import { ApiInfo } from '../../apiService'

export const RogueApUrls: { [key: string]: ApiInfo } = {
  deleteRogueApPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId'
  },
  deleteRogueApPolicies: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles'
  },
  addRoguePolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles'
  },
  getRoguePolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId'
  },
  updateRoguePolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId'
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
