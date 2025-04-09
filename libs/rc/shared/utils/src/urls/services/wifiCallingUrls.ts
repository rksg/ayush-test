import { ApiInfo } from '@acx-ui/utils'

export const WifiCallingUrls: { [key: string]: ApiInfo } = {
  getWifiCalling: {
    method: 'get',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  getWifiCallingRbac: {
    method: 'get',
    url: '/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getEnhancedWifiCallingList: {
    method: 'post',
    url: '/enhancedWifiCallingProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedWifiCallingProfiles/query',
    newApi: true
  },
  queryWifiCalling: {
    method: 'post',
    url: '/wifiCallingServiceProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  addWifiCalling: {
    method: 'post',
    url: '/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  addWifiCallingRbac: {
    method: 'post',
    url: '/wifiCallingServiceProfiles',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateWifiCalling: {
    method: 'put',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  updateWifiCallingRbac: {
    method: 'put',
    url: '/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  deleteWifiCallingRbac: {
    method: 'delete',
    url: '/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteWifiCallingList: {
    method: 'delete',
    url: '/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  activateWifiCalling: {
    method: 'put',
    url: '/wifiNetworks/:networkId/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/wifiNetworks/{id}/wifiCallingServiceProfiles/{id}'
  },
  deactivateWifiCalling: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/wifiCallingServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/wifiNetworks/{id}/wifiCallingServiceProfiles/{id}'
  }
}
