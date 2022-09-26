import { ApiInfo } from '../apiService'

export const SwitchUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/api/switch/tenant/{tenantId}/venue/{venueId}/aaaSetting'
  },
  updateAaaSetting: {
    method: 'put',
    url: '/api/switch/tenant/{tenantId}/venue/{venueId}/aaaSetting'
  },
  getAaaServerList: {
    method: 'get',
    url: '/api/switch/tenant/{tenantId}/aaaServer/query'
  },
  addAaaServer: {
    method: 'post',
    url: '/api/switch/tenant/{tenantId}/venue/{venueId}/aaaServer'
  },
  updateAaaServer: {
    method: 'put',
    url: '/api/switch/tenant/{tenantId}/venue/{venueId}/aaaServer'
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/{tenantId}/aaaServer/{aaaServerId}'
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/{tenantId}/aaaServer'
  }
}
