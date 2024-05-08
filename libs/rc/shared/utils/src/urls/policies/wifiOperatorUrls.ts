import { ApiInfo } from '@acx-ui/utils'

export const WifiOperatorUrls: { [key: string]: ApiInfo } = {
  addWifiOperator: {
    method: 'post',
    url: '/hotspot20Operators',
    newApi: true
  },
  updateWifiOperator: {
    method: 'put',
    url: '/hotspot20Operators/:policyId',
    newApi: true
  },
  deleteWifiOperator: {
    method: 'delete',
    url: '/hotspot20Operators/:policyId',
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
    newApi: true
  },
  activateWifiOperatorOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:wifiNetworkId/hotspot20Operators/:operatorId',
    newApi: true
  }
}