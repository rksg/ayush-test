import { ApiInfo } from '../apiService'

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
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true'
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/aaaServer/:aaaServerId'
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/aaaServer'
  }
}
