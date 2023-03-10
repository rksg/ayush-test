import { ApiInfo } from '../../apiService'

export const MdnsProxyUrls: { [key: string]: ApiInfo } = {
  getMdnsProxyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles'
  },
  getMdnsProxy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId'
  },
  addMdnsProxy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles'
  },
  updateMdnsProxy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId'
  },
  deleteMdnsProxy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId'
  },
  deleteMdnsProxyList: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles'
  },
  addMdnsProxyAps: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId/aps'
  },
  deleteMdnsProxyAps: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId/aps'
  },
  getMdnsProxyApsByVenue: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venues/:venueId/mDnsProxyServiceProfileAps'
  },
  getEnhancedMdnsProxyList: {
    method: 'post',
    url: '/enhancedMdnsProxyProfiles/query'
  }
}
