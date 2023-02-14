import { ApiInfo } from '../../apiService'

export const AccessControlUrls: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/l2AclPolicies',
    newApi: true
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/l2AclPolicies/:l2AclPolicyId',
    newApi: true
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/l3AclPolicies',
    newApi: true
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/l3AclPolicies/:l3AclPolicyId',
    newApi: true
  },
  addAppPolicy: {
    method: 'post',
    url: '/applicationPolicies',
    newApi: true
  },
  getAppPolicy: {
    method: 'get',
    url: '/applicationPolicies/:applicationPolicyId',
    newApi: true
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/l2AclPolicies/query',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/l3AclPolicies/query',
    newApi: true
  },
  getAppPolicyList: {
    method: 'post',
    url: '/applicationPolicies/query',
    newApi: true
  },
  getAvcCategory: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities/avc-cat'
  },
  getAvcApp: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities/avc-app'
  },
  addDevicePolicy: {
    method: 'post',
    url: '/devicePolicies',
    newApi: true
  },
  getDevicePolicy: {
    method: 'get',
    url: '/devicePolicies/:devicePolicyId',
    newApi: true
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/devicePolicies/query',
    newApi: true
  }
}
