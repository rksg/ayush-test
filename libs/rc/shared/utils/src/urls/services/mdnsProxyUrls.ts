import { ApiInfo } from '@acx-ui/utils'

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
    url: '/venues/:venueId/mDnsProxyProfileAps',
    oldUrl: '/api/tenant/:tenantId/wifi/venues/:venueId/mDnsProxyProfileAps',
    newApi: true
  },
  getEnhancedMdnsProxyList: {
    method: 'post',
    url: '/enhancedMdnsProxyProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedMdnsProxyProfiles/query',
    newApi: true
  },

  queryMdnsProxy: {
    method: 'post',
    url: '/multicastDnsProxyProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getMdnsProxyRbac: {
    method: 'get',
    url: '/multicastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addMdnsProxyRbac: {
    method: 'post',
    url: '/multicastDnsProxyProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateMdnsProxyRbac: {
    method: 'put',
    url: '/multicastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteMdnsProxyRbac: {
    method: 'delete',
    url: '/multicastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addMdnsProxyApsRbac: {
    method: 'put',
    url: '/venues/:venueId/aps/:apSerialNumber/multicastDnsProxyProfiles/:serviceId',
    newApi: true,
    // eslint-disable-next-line max-len
    opsApi: 'PUT:/venues/{id}/aps/{id}/multicastDnsProxyProfiles/{id}',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteMdnsProxyApsRbac: {
    method: 'delete',
    url: '/venues/:venueId/aps/:apSerialNumber/multicastDnsProxyProfiles/:serviceId',
    opsApi: 'DELETE:/venues/{id}/aps/{id}/multicastDnsProxyProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
