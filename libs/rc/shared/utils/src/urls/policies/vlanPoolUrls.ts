import { ApiInfo } from '@acx-ui/utils'

export const VlanPoolUrls: { [key: string]: ApiInfo } = {
  deleteVLANPoolPolicy: {
    method: 'delete',
    url: '/vlanPools/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId',
    newApi: true
  },
  addVLANPoolPolicy: {
    method: 'post',
    url: '/vlanPools',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool',
    newApi: true
  },
  getVLANPoolPolicy: {
    method: 'get',
    url: '/vlanPools/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId',
    newApi: true
  },
  updateVLANPoolPolicy: {
    method: 'put',
    url: '/vlanPools/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool/:policyId',
    newApi: true
  },
  getVLANPoolPolicyList: {
    method: 'post',
    url: '/vlanPools/query',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool/query',
    newApi: true
  },
  getVLANPoolVenues: {
    method: 'post',
    url: '/vlanPools/:policyId/venues',
    oldUrl: '/api/vlanPools/:policyId/venues',
    newApi: true
  }
}
