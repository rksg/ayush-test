import { ApiInfo } from '../../apiService'

export const VlanPoolUrls: { [key: string]: ApiInfo } = {
  deleteVLANPoolPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId'
  },
  addVLANPoolPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/vlan-pool'
  },
  getVLANPoolPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId'
  },
  updateVLANPoolPolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId'
  },
  getVLANPoolPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/vlan-pool/query'
  },
  getVLANPoolVenues: {
    method: 'post',
    url: '/api/vlanPools/:policyId/venues'
  }
}
