import { ApiInfo } from '../../apiService'

export const VlanPoolUrls: { [key: string]: ApiInfo } = {
  deleteVLANPoolPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/vlanpoolpolicies/:policyId'
  },
  addVLANPoolPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/vlanpoolPolicyProfiles'
  },
  getVLANPoolPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlanpoolPolicyProfiles/:policyId'
  },
  updateVLANPoolPolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/vlanpoolPolicyProfiles/:policyId'
  },
  getVLANPoolPolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlanpoolPolicyProfiles'
  },
  getVLANPoolNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/vlanpool-policy-profile/instances/:policyId'
  },
  getVLANPoolProfileDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId/vlanpool-policy-profile/:policyId'
  }
}
