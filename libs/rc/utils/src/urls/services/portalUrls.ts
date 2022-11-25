import { ApiInfo } from '../../apiService'

export const PortalUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting'
  },
  updateAaaSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting'
  },
  getAaaServerList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/aaaServer/query'
  },
  addAaaServer: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer'
  },
  savePortal: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/portal/deep?quickAck=true'
  },
  getPortalNetworkInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/instances/:serviceId'
  },
  getPortalProfileDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId/portal-service-profile/:serviceId'
  }
}
