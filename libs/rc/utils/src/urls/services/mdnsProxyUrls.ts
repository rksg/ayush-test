import { ApiInfo } from '../../apiService'

export const MdnsProxyUrls: { [key: string]: ApiInfo } = {
  getMdnsProxyList: {
    method: 'get',
    url: '/mDnsProxyServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles',
    newApi: true
  },
  getMdnsProxy: {
    method: 'get',
    url: '/mDnsProxyServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId',
    newApi: true
  },
  addMdnsProxy: {
    method: 'post',
    url: '/mDnsProxyServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles',
    newApi: true
  },
  updateMdnsProxy: {
    method: 'put',
    url: '/mDnsProxyServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId',
    newApi: true
  },
  deleteMdnsProxy: {
    method: 'delete',
    url: '/mDnsProxyServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId',
    newApi: true
  },
  deleteMdnsProxyList: {
    method: 'delete',
    url: '/mDnsProxyServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles',
    newApi: true
  },
  addMdnsProxyAps: {
    method: 'post',
    url: '/mDnsProxyServiceProfiles/:serviceId/aps',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId/aps',
    newApi: true
  },
  deleteMdnsProxyAps: {
    method: 'delete',
    url: '/mDnsProxyServiceProfiles/:serviceId/aps',
    oldUrl: '/api/tenant/:tenantId/wifi/mDnsProxyServiceProfiles/:serviceId/aps',
    newApi: true
  },
  getMdnsProxyApsByVenue: {
    method: 'get',
    url: '/venues/:venueId/mDnsProxyServiceProfileAps',
    oldUrl: '/api/tenant/:tenantId/wifi/venues/:venueId/mDnsProxyServiceProfileAps',
    newApi: true
  }
}
