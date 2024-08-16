import { ApiInfo } from '@acx-ui/utils'

export const AccessControlUrls: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  addL2AclPolicyRbac: {
    method: 'post',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getL2AclPolicyRbac: {
    method: 'get',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateL2AclPolicy: {
    method: 'put',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true
  },
  updateL2AclPolicyRbac: {
    method: 'put',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delL2AclPolicy: {
    method: 'delete',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true
  },
  delL2AclPolicyRbac: {
    method: 'delete',
    url: '/l2AclPolicies/:l2AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delL2AclPolicies: {
    method: 'delete',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true
  },
  addL3AclPolicyRbac: {
    method: 'post',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getL3AclPolicyRbac: {
    method: 'get',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateL3AclPolicy: {
    method: 'put',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true
  },
  updateL3AclPolicyRbac: {
    method: 'put',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delL3AclPolicy: {
    method: 'delete',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true
  },
  delL3AclPolicyRbac: {
    method: 'delete',
    url: '/l3AclPolicies/:l3AclPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delL3AclPolicies: {
    method: 'delete',
    url: '/l3AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy',
    newApi: true
  },
  addAppPolicy: {
    method: 'post',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true
  },
  addAppPolicyRbac: {
    method: 'post',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAppPolicy: {
    method: 'get',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAppPolicyRbac: {
    method: 'get',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAppAclPolicy: {
    method: 'put',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true
  },
  updateAppAclPolicyRbac: {
    method: 'put',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delAppAclPolicy: {
    method: 'delete',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true
  },
  delAppAclPolicyRbac: {
    method: 'delete',
    url: '/applicationPolicies/:applicationPolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delAppAclPolicies: {
    method: 'delete',
    url: '/applicationPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy',
    newApi: true
  },
  getL2AclPolicyList: {
    method: 'get',
    url: '/l2AclPolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy',
    newApi: true
  },
  getL2AclPolicyListQuery: {
    method: 'post',
    url: '/l2AclPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
  getL3AclPolicyListQuery: {
    method: 'post',
    url: '/l3AclPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
  getApplicationPolicyListQuery: {
    method: 'post',
    url: '/applicationPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
  getAvcCategoryRbac: {
    method: 'get',
    url: '/applicationLibraries/:applicationLibraryId/categories',
    newApi: true
  },
  getAvcApp: {
    // [New API] private api
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/capabilities/avc-app',
    url: '/applicationPolicies/capabilities/applications',
    newApi: true
  },
  getAvcAppRbac: {
    method: 'get',
    url: '/applicationLibraries/:applicationLibraryId/categories/:categoryId/applications',
    newApi: true
  },
  getAccessControlProfile: {
    method: 'get',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAccessControlProfileRbac: {
    method: 'get',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true
  },
  getAccessControlProfileQueryList: {
    method: 'post',
    url: '/accessControlProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
  addAccessControlProfileRbac: {
    method: 'post',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateAccessControlProfileRbac: {
    method: 'put',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true
  },
  deleteAccessControlProfileRbac: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  addDevicePolicyRbac: {
    method: 'post',
    url: '/devicePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDevicePolicy: {
    method: 'get',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDevicePolicyRbac: {
    method: 'get',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delDevicePolicy: {
    method: 'delete',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true
  },
  delDevicePolicyRbac: {
    method: 'delete',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  updateDevicePolicyRbac: {
    method: 'put',
    url: '/devicePolicies/:devicePolicyId',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDevicePolicyList: {
    method: 'get',
    url: '/devicePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy',
    newApi: true
  },
  getDevicePolicyListQuery: {
    method: 'post',
    url: '/devicePolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedDevicePolicies: {
    method: 'post',
    url: '/enhancedDevicePolicies/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedDevicePolicies/query',
    newApi: true
  },
  activateL2AclOnAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL2AclOnAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL2AclOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:networkId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL2AclOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL3AclOnAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL3AclOnAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL3AclOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:networkId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL3AclOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateDevicePolicyOnAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateDevicePolicyOnAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateDevicePolicyOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:networkId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateDevicePolicyOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApplicationPolicyOnAccessControlProfile: {
    method: 'put',
    url: '/accessControlProfiles/:policyId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApplicationPolicyOnAccessControlProfile: {
    method: 'delete',
    url: '/accessControlProfiles/:policyId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApplicationPolicyOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:networkId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApplicationPolicyOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  applicationLibrarySettings: {
    method: 'get',
    url: '/applicationLibrarySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  applicationLibrariesCategoryList: {
    method: 'get',
    url: '/applicationLibraries/:applicationLibraryId/categories',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  applicationLibrariesApplicationList: {
    method: 'get',
    url: '/applicationLibraries/:applicationLibraryId/categories/:categoryId/applications',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateAccessControlProfileOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:networkId/accessControlProfiles/:accessControlProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateAccessControlProfileOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/accessControlProfiles/:accessControlProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
