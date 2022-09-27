import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  getVlanPools: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlan-pool'
  },
  getNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/network/:networkId/deep'
  },
  addNetworkDeep: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true'
  },
  updateNetworkDeep: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/network/:networkId/deep?quickAck=true'
  },
  deleteNetwork: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/network/:networkId'
  },
  addNetworkVenue: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network-venue'
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/network-venue/:networkVenueId'
  }
}
