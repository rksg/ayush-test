import { ApiInfo } from '../../apiService'

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/radius/:policyId'
  },
  addAAAPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/radius'
  },
  getAAAPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/radius/:policyId'
  },
  updateAAAPolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/radius/:policyId'
  },
  getAAAPolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/radius'
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
