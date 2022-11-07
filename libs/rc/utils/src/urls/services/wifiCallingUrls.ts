import { ApiInfo } from '../../apiService'

export const WifiCallingUrls: { [key: string]: ApiInfo } = {
  getWifiCalling: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId'
  },
  getWifiCallingList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles'
  },
  addWifiCalling: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles'
  },
  updateWifiCalling: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId'
  },
  deleteWifiCalling: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles/:serviceId'
  },
  deleteWifiCallingList: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/wificallingserviceprofiles'
  }
}
