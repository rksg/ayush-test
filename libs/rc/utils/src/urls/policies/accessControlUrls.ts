import { ApiInfo } from '../../apiService'

export const AccessControlUrls: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l2-acl-policy'
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId'
  },
  delL2AclPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId'
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy'
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId'
  },
  delL3AclPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId'
  },
  addAppPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/application-policy'
  },
  getAppPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId'
  },
  delAppAclPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId'
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l2-acl-policy/query'
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy/query'
  },
  getAppPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/application-policy/query'
  },
  getAvcCategory: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities/avc-cat'
  },
  getAvcApp: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities/avc-app'
  },
  getAccessControlProfile: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId'
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/access-control-profile'
  },
  addAccessControlProfile: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/access-control-profile'
  },
  updateAccessControlProfile: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId'
  },
  deleteAccessControlProfile: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId'
  },
  addDevicePolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/device-policy'
  },
  getDevicePolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId'
  },
  delDevicePolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId'
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/device-policy/query'
  }
}
