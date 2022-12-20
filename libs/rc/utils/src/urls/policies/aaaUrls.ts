import { ApiInfo } from '../../apiService'

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/aaapolicies/:policyId'
  },
  addAAAPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/aaaPolicyProfiles'
  },
  getAAAPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/aaaPolicyProfiles/:policyId'
  },
  updateAAAPolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/aaaPolicyProfiles/:policyId'
  },
  getAAAPolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/aaaPolicyProfiles'
  },
  getAAANetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/aaa-policy-profile/instances/:policyId'
  },
  getAAAProfileDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId/aaa-policy-profile/:policyId'
  }
}
