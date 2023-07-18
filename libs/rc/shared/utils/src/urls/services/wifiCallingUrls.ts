import { ApiInfo } from '@acx-ui/utils'

export const WifiCallingUrls: { [key: string]: ApiInfo } = {
  getWifiCalling: {
    method: 'get',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  getWifiCallingList: {
    method: 'get',
    url: '/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  getEnhancedWifiCallingList: {
    method: 'post',
    url: '/enhancedWifiCallingProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedWifiCallingProfiles/query',
    newApi: true
  },
  addWifiCalling: {
    method: 'post',
    url: '/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  updateWifiCalling: {
    method: 'put',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  deleteWifiCallingList: {
    method: 'delete',
    url: '/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  }
}
