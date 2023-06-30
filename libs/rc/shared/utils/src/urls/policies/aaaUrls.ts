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
    newApi: true
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
    newApi: true
  },
  getAAAPolicyList: {
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    url: '/radiusServerProfiles',
    newApi: true
  },
  getAAAPolicyViewModelList: {
    method: 'post',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedRadiusServerProfiles/query',
    url: '/enhancedRadiusServerProfiles/query',
    newApi: true
  },
  getAAANetworkInstances: {
    method: 'post',
    oldUrl: '/api/radius/:policyId/networks',
    url: '/radiusServerProfiles/:policyId/networks',
    newApi: true
  },
  getAAAProfileDetail: {
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true
  }
}
