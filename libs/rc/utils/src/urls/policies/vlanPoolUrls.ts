import { ApiInfo } from '../../apiService'

export const VlanPoolUrls: { [key: string]: ApiInfo } = {
  deleteVLANPoolPolicy: {
    method: 'delete',
    url: '/vlanPools/:policyId',
    newApi: true
  },
  addVLANPoolPolicy: {
    method: 'post',
    url: '/vlanPools',
    newApi: true
  },
  getVLANPoolPolicy: {
    method: 'get',
    url: '/vlanPools/:policyId',
    newApi: true
  },
  updateVLANPoolPolicy: {
    method: 'put',
    url: '/vlanPools/:policyId',
    newApi: true
  },
  getVLANPoolPolicyList: {
    method: 'post',
    url: '/vlanPools/query',
    newApi: true
  },
  getVLANPoolVenues: {
    method: 'post',
    url: '/api/vlanPools/:policyId/venues'
  }
}
