import { ApiInfo } from '../../apiService'

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicy: {
    method: 'delete',
    url: '/radiusServerProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    newApi: true
  },
  addAAAPolicy: {
    method: 'post',
    url: '/radiusServerProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    newApi: true
  },
  getAAAPolicy: {
    method: 'get',
    url: '/radiusServerProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    newApi: true
  },
  updateAAAPolicy: {
    method: 'put',
    url: '/radiusServerProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    newApi: true
  },
  getAAAPolicyList: {
    method: 'get',
    url: '/radiusServerProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    newApi: true
  },
  getAAANetworkInstances: {
    method: 'post',
    url: '/radiusServerProfiles/:policyId/networks',
    oldUrl: '/api/radius/:policyId/networks',
    newApi: true
  },
  getAAAProfileDetail: {
    method: 'get',
    url: '/radiusServerProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    newApi: true
  }
}
