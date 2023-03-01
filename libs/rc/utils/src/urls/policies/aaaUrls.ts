import { ApiInfo } from '../../apiService'

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicy: {
    method: 'delete',
    url: '/radiusServerProfiles/:policyId'
  },
  addAAAPolicy: {
    method: 'post',
    url: '/radiusServerProfiles'
  },
  getAAAPolicy: {
    method: 'get',
    url: '/radiusServerProfiles/:policyId'
  },
  updateAAAPolicy: {
    method: 'put',
    url: '/radiusServerProfiles/:policyId'
  },
  getAAAPolicyList: {
    method: 'get',
    url: '/radiusServerProfiles'
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
