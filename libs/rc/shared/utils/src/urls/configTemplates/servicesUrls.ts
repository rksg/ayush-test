import { ApiInfo } from '@acx-ui/utils'

export const ServicesConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/templates/dpskServices/:serviceId',
    newApi: true
  },
  addDpsk: {
    method: 'post',
    url: '/templates/dpskServices',
    newApi: true
  },
  updateDpsk: {
    method: 'put',
    url: '/templates/dpskServices/:serviceId',
    newApi: true
  },
  deleteDpsk: {
    method: 'delete',
    url: '/templates/dpskServices/:templateId',
    newApi: true
  },
  getEnhancedDpskList: {
    method: 'post',
    url: '/templates/dpskServices/query',
    newApi: true
  },
  addDhcp: {
    method: 'post',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true
  },
  addDhcpRbac: {
    method: 'post',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDhcpList: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true
  },
  updateDhcp: {
    method: 'put',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true
  },
  updateDhcpRbac: {
    method: 'put',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDHCProfileDetail: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true
  },
  getDHCProfileDetailRbac: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteDhcp: {
    method: 'delete',
    url: '/templates/dhcpConfigServiceProfiles/:templateId',
    newApi: true
  },
  deleteDhcpRbac: {
    method: 'delete',
    url: '/templates/dhcpConfigServiceProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  queryDHCPProfiles: {
    method: 'post',
    url: '/templates/dhcpConfigServiceProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getPortal: {
    method: 'get',
    url: '/templates/portalServiceProfiles/:serviceId',
    newApi: true
  },
  addPortal: {
    method: 'post',
    url: '/templates/portalServiceProfiles',
    newApi: true
  },
  updatePortal: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId',
    newApi: true
  },
  deletePortal: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:templateId',
    newApi: true
  },
  getEnhancedPortalList: {
    method: 'post',
    url: '/templates/portalServiceProfiles/query',
    newApi: true
  },
  uploadPhoto: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId/photos',
    newApi: true
  },
  uploadLogo: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId/logos',
    newApi: true
  },
  uploadBgImage: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId/backgroundImages',
    newApi: true
  },
  uploadPoweredImg: {
    method: 'put',
    url: '/templates/portalServiceProfiles/:serviceId/poweredImages',
    newApi: true
  },
  deletePhoto: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:serviceId/photos',
    newApi: true
  },
  deleteLogo: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:serviceId/logos',
    newApi: true
  },
  deleteBgImage: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:serviceId/backgroundImages',
    newApi: true
  },
  deletePoweredImg: {
    method: 'delete',
    url: '/templates/portalServiceProfiles/:serviceId/poweredImages',
    newApi: true
  },
  getWifiCalling: {
    method: 'get',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    newApi: true
  },
  getWifiCallingList: {
    method: 'get',
    url: '/templates/wifiCallingServiceProfiles',
    newApi: true
  },
  getEnhancedWifiCallingList: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles/query',
    newApi: true
  },
  addWifiCalling: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles',
    newApi: true
  },
  updateWifiCalling: {
    method: 'put',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    newApi: true
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/templates/wifiCallingServiceProfiles/:templateId',
    newApi: true
  }
}
