import { ApiInfo } from '../apiService'

export const MdnsProxyUrls: { [key: string]: ApiInfo } = {
  getMdnsProxy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/mdnsProxyServiceProfiles/:serviceId'
  },
  addMdnsProxy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/mdnsProxyServiceProfiles'
  },
  updateMdnsProxy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/mdnsProxyServiceProfiles/:serviceId'
  },
  deleteMdnsProxy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/mdnsProxyServiceProfiles/:serviceId'
  },
  deleteMdnsProxyList: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/mdnsProxyServiceProfiles'
  }
}
