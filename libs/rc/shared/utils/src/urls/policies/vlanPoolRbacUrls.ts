import { ApiInfo } from '@acx-ui/utils'


export const VlanPoolRbacUrls: { [key:string]:ApiInfo } = {
  deleteVLANPoolPolicy: {
    method: 'delete',
    url: '/vlanPoolProfiles/:policyId',
    newApi: true
  },
  addVLANPoolPolicy: {
    method: 'post',
    url: '/vlanPoolProfiles',
    newApi: true
  },
  updateVLANPoolPolicy: {
    method: 'put',
    url: '/vlanPoolProfiles/:policyId',
    newApi: true
  },
  getVLANPoolPolicyList: {
    method: 'post',
    url: '/vlanPoolProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVLANPoolPolicy: {
    method: 'get',
    url: '/vlanPoolProfiles/:policyId',
    newApi: true
  }
}
