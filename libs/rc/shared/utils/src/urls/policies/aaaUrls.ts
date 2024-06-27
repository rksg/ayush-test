import { ApiInfo } from '@acx-ui/utils'

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicyList: {
    method: 'delete',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/',
    url: '/radiusServerProfiles',
    newApi: true
  },
  addAAAPolicy: {
    method: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    url: '/radiusServerProfiles',
    newApi: true,
    headers: {
      'Accept': 'application/vnd.ruckus.v1_1+json',
      'Content-Type': 'application/vnd.ruckus.v1_1+json'
    }
  },
  getAAAPolicy: {
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true
  },
  updateAAAPolicy: {
    method: 'put',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true,
    headers: {
      'Accept': 'application/vnd.ruckus.v1_1+json',
      'Content-Type': 'application/vnd.ruckus.v1_1+json'
    }
  },
  getAAAPolicyViewModelList: {
    method: 'post',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedRadiusServerProfiles/query',
    url: '/enhancedRadiusServerProfiles/query',
    newApi: true
  },
  queryAAAPolicyList: {
    method: 'post',
    url: '/radiusServerProfiles/query',
    newApi: true,
    headers: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteAAAPolicy: {
    method: 'delete',
    url: '/radiusServerProfiles/:policyId',
    newApi: true
  }
}
