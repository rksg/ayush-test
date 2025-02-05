import { ApiInfo } from '@acx-ui/utils'

export const WifiOperatorUrls: { [key: string]: ApiInfo } = {
  addWifiOperator: {
    method: 'post',
    url: '/hotspot20Operators',
    opsApi: 'POST:/hotspot20Operators',
    newApi: true
  },
  updateWifiOperator: {
    method: 'put',
    url: '/hotspot20Operators/:policyId',
    opsApi: 'PUT:/hotspot20Operators/{id}',
    newApi: true
  },
  deleteWifiOperator: {
    method: 'delete',
    url: '/hotspot20Operators/:policyId',
    opsApi: 'DELETE:/hotspot20Operators/{id}',
    newApi: true
  },
  getWifiOperator: {
    method: 'get',
    url: '/hotspot20Operators/:policyId',
    newApi: true
  },
  getWifiOperatorList: {
    method: 'post',
    url: '/hotspot20Operators/query',
    opsApi: 'POST:/hotspot20Operators/query',
    newApi: true
  },
  activateWifiOperatorOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:wifiNetworkId/hotspot20Operators/:operatorId',
    opsApi: 'PUT:/wifiNetworks/{id}/hotspot20Operators/{id}',
    newApi: true
  }
}