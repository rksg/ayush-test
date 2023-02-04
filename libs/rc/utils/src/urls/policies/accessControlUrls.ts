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
  addL3AclPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy'
  },
  getL3AclPolicy: {
    method: 'get',
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
  }
}
