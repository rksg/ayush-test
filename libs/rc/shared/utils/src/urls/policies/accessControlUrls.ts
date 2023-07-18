import { ApiInfo } from '@acx-ui/utils'

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
  delL2AclPolicy: {
    method: 'delete',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true
  },
  delL2AclPolicies: {
    method: 'delete',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  updateL2AclPolicy: {
    method: 'put',
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
  delL3AclPolicy: {
    method: 'delete',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true
  },
  delL3AclPolicies: {
    method: 'delete',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true
  },
  updateL3AclPolicy: {
    method: 'put',
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
  delAppAclPolicy: {
    method: 'delete',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true
  },
  delAppAclPolicies: {
    method: 'delete',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true
  },
  updateAppAclPolicy: {
    method: 'put',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true
  },
  getL2AclPolicyList: {
    method: 'get',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  getEnhancedL2AclPolicies: {
    method: 'post',
    url: '/enhancedL2AclPolicies/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedL2AclPolicies/query',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'get',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true
  },
  getEnhancedL3AclPolicies: {
    method: 'post',
    url: '/enhancedL3AclPolicies/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedL3AclPolicies/query',
    newApi: true
  },
  getAppPolicyList: {
    method: 'get',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true
  },
  getEnhancedApplicationPolicies: {
    method: 'post',
    url: '/enhancedApplicationPolicies/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedApplicationPolicies/query',
    newApi: true
  },
  getAvcCategory: {
    // [New API] private api
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/capabilities/avc-cat',
    url: '/applicationPolicies/capabilities/categories',
    newApi: true

  },
  getAvcApp: {
    // [New API] private api
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/capabilities/avc-app',
    url: '/applicationPolicies/capabilities/applications',
    newApi: true
  },
  getAccessControlProfile: {
    method: 'get',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true
  },
  getEnhancedAccessControlProfiles: {
    method: 'post',
    url: '/enhancedAccessControlProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedAccessControlProfiles/query',
    newApi: true
  },
  addAccessControlProfile: {
    method: 'post',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true
  },
  updateAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true
  },
  deleteAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true
  },
  deleteAccessControlProfiles: {
    method: 'delete',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true
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
  delDevicePolicy: {
    method: 'delete',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true
  },
  delDevicePolicies: {
    method: 'delete',
    url: '/devicePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy',
    newApi: true
  },
  updateDevicePolicy: {
    method: 'put',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true
  },
  getDevicePolicyList: {
    method: 'get',
    url: '/devicePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy',
    newApi: true
  },
  getEnhancedDevicePolicies: {
    method: 'post',
    url: '/enhancedDevicePolicies/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedDevicePolicies/query',
    newApi: true
  }
}
