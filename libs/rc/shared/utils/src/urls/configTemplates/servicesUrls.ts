import { ApiInfo } from '@acx-ui/utils'

export const ServicesConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/templates/dpskServices/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  addDpsk: {
    method: 'post',
    url: '/templates/dpskServices',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  updateDpsk: {
    method: 'put',
    url: '/templates/dpskServices/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteDpsk: {
    method: 'delete',
    url: '/templates/dpskServices/:templateId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedDpskList: {
    method: 'post',
    url: '/templates/dpskServices/query',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  addDhcp: {
    method: 'post',
    url: '/templates/dhcpConfigServiceProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDHCProfileDetail: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  deleteDhcp: {
    method: 'delete',
    url: '/templates/dhcpConfigServiceProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
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
  updateDhcpRbac: {
    method: 'put',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDhcpProfileDetailRbac: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  queryDhcpProfiles: {
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
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedWifiCallingList: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles/query',
    newApi: true
  },
  addWifiCalling: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  updateWifiCalling: {
    method: 'put',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/templates/wifiCallingServiceProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getWifiCallingRbac: {
    method: 'get',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addWifiCallingRbac: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateWifiCallingRbac: {
    method: 'put',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteWifiCallingRbac: {
    method: 'delete',
    url: '/templates/wifiCallingServiceProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  queryWifiCalling: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  activateWifiCalling: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/templates/wifiNetworks/{id}/wifiCallingServiceProfiles/{id}'
  },
  deactivateWifiCalling: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/templates/wifiNetworks/{id}/wifiCallingServiceProfiles/{id}'
  },
  activateDpskService: {
    method: 'PUT',
    newApi: true,
    url: '/templates/wifiNetworks/:networkId/dpskServices/:dpskServiceId',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  queryDpskService: {
    method: 'GET',
    newApi: true,
    url: '/templates/wifiNetworks/:networkId/dpskServices',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activatePortal: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/portalServiceProfiles/:serviceId',
    newApi: true
  }
}
