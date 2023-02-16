import { ApiInfo } from '../../apiService'

export const AccessControlUrls: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true
  },
  addAppPolicy: {
    method: 'post',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true
  },
  getAppPolicy: {
    method: 'get',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/l2AclPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/query',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/l3AclPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/query',
    newApi: true
  },
  getAppPolicyList: {
    method: 'post',
    url: '/applicationPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/query',
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
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy',
    newApi: true
  },
  getDevicePolicy: {
    method: 'get',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/devicePolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/query',
    newApi: true
  }
}
