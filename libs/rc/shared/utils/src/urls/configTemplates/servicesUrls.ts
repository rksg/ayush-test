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
  getDhcp: {
    method: 'get',
    url: '/templates/dhcpConfigServiceProfiles/:serviceId',
    newApi: true
  },
  deleteDhcp: {
    method: 'delete',
    url: '/templates/dhcpConfigServiceProfiles/:templateId',
    newApi: true
  },
  getWifiCalling: {
    method: 'get',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  getWifiCallingList: {
    method: 'get',
    url: '/templates/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  getEnhancedWifiCallingList: {
    method: 'post',
    url: '/templates/enhancedWifiCallingProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedWifiCallingProfiles/query',
    newApi: true
  },
  addWifiCalling: {
    method: 'post',
    url: '/templates/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  },
  updateWifiCalling: {
    method: 'put',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/templates/wifiCallingServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId',
    newApi: true
  },
  deleteWifiCallingList: {
    method: 'delete',
    url: '/templates/wifiCallingServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles',
    newApi: true
  }
}
