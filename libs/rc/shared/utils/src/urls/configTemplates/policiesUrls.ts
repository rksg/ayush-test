import { ApiInfo } from '@acx-ui/utils'

export const PoliciesConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/templates/l2AclPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addL2AclPolicyRbac: {
    method: 'post',
    url: '/templates/l2AclPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true
  },
  getL2AclPolicyRbac: {
    method: 'get',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedL2AclPolicies: {
    method: 'post',
    url: '/templates/l2AclPolicies/query',
    newApi: true
  },
  getL2AclPolicyListQuery: {
    method: 'post',
    url: '/templates/l2AclPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delL2AclPolicy: {
    method: 'delete',
    url: '/templates/l2AclPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delL2AclPolicyRbac: {
    method: 'delete',
    url: '/templates/l2AclPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateL2AclPolicy: {
    method: 'put',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateL2AclPolicyRbac: {
    method: 'put',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/templates/l3AclPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addL3AclPolicyRbac: {
    method: 'post',
    url: '/templates/l3AclPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true
  },
  getL3AclPolicyRbac: {
    method: 'get',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedL3AclPolicies: {
    method: 'post',
    url: '/templates/l3AclPolicies/query',
    newApi: true
  },
  getL3AclPolicyListQuery: {
    method: 'post',
    url: '/templates/l3AclPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delL3AclPolicy: {
    method: 'delete',
    url: '/templates/l3AclPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delL3AclPolicyRbac: {
    method: 'delete',
    url: '/templates/l3AclPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateL3AclPolicy: {
    method: 'put',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateL3AclPolicyRbac: {
    method: 'put',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addAppPolicy: {
    method: 'post',
    url: '/templates/applicationPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addAppPolicyRbac: {
    method: 'post',
    url: '/templates/applicationPolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAppPolicy: {
    method: 'get',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAppPolicyRbac: {
    method: 'get',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getEnhancedApplicationPolicies: {
    method: 'post',
    url: '/templates/applicationPolicies/query',
    newApi: true
  },
  getApplicationPolicyListQuery: {
    method: 'post',
    url: '/templates/applicationPolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delAppAclPolicy: {
    method: 'delete',
    url: '/templates/applicationPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  delAppAclPolicyRbac: {
    method: 'delete',
    url: '/templates/applicationPolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAppAclPolicy: {
    method: 'put',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateAppAclPolicyRbac: {
    method: 'put',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getL2AclPolicyList: {
    method: 'get',
    url: '/templates/l2AclPolicies',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'get',
    url: '/templates/l3AclPolicies',
    newApi: true
  },
  getAppPolicyList: {
    method: 'get',
    url: '/templates/applicationPolicies',
    newApi: true
  },
  getAvcCategory: {
    // [New API] private api
    method: 'get',
    url: '/templates/applicationPolicies/capabilities/categories',
    newApi: true

  },
  getAvcApp: {
    // [New API] private api
    method: 'get',
    url: '/templates/applicationPolicies/capabilities/applications',
    newApi: true
  },
  getAccessControlProfile: {
    method: 'get',
    url: '/templates/accessControlProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getAccessControlProfileRbac: {
    method: 'get',
    url: '/templates/accessControlProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/templates/accessControlProfiles',
    newApi: true
  },
  getEnhancedAccessControlProfiles: {
    method: 'post',
    url: '/templates/accessControlProfiles/query',
    newApi: true
  },
  getAccessControlProfileQueryList: {
    method: 'post',
    url: '/templates/accessControlProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addAccessControlProfile: {
    method: 'post',
    url: '/templates/accessControlProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addAccessControlProfileRbac: {
    method: 'post',
    url: '/templates/accessControlProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateAccessControlProfileRbac: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteAccessControlProfileRbac: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addDevicePolicy: {
    method: 'post',
    url: '/templates/devicePolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addDevicePolicyRbac: {
    method: 'post',
    url: '/templates/devicePolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDevicePolicy: {
    method: 'get',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDevicePolicyRbac: {
    method: 'get',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delDevicePolicy: {
    method: 'delete',
    url: '/templates/devicePolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  delDevicePolicyRbac: {
    method: 'delete',
    url: '/templates/devicePolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateDevicePolicy: {
    method: 'put',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateDevicePolicyRbac: {
    method: 'put',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getDevicePolicyList: {
    method: 'get',
    url: '/templates/devicePolicies',
    newApi: true
  },
  getEnhancedDevicePolicies: {
    method: 'post',
    url: '/templates/devicePolicies/query',
    newApi: true
  },
  getDevicePolicyListQuery: {
    method: 'post',
    url: '/templates/devicePolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteVlanPoolPolicy: {
    method: 'delete',
    url: '/templates/vlanPools/:templateId',
    newApi: true
  },
  addVlanPoolPolicy: {
    method: 'post',
    url: '/templates/vlanPools',
    newApi: true
  },
  getVlanPoolPolicy: {
    method: 'get',
    url: '/templates/vlanPools/:policyId',
    newApi: true
  },
  updateVlanPoolPolicy: {
    method: 'put',
    url: '/templates/vlanPools/:policyId',
    newApi: true
  },
  getVlanPoolVenues: {
    method: 'post',
    url: '/templates/vlanPools/:policyId/venues',
    newApi: true
  },
  getVlanPoolPolicyList: {
    method: 'post',
    url: '/templates/vlanPoolProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEnhancedVlanPools: {
    method: 'post',
    url: '/templates/enhancedVlanPoolProfiles/query',
    newApi: true
  },
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/templates/syslogServerProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSyslogPolicyRbac: {
    method: 'delete',
    url: '/templates/syslogServerProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  addSyslogPolicy: {
    method: 'post',
    url: '/templates/syslogServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addSyslogPolicyRbac: {
    method: 'post',
    url: '/templates/syslogServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getSyslogPolicy: {
    method: 'get',
    url: '/templates/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getSyslogPolicyRbac: {
    method: 'get',
    url: '/templates/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/templates/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateSyslogPolicyRbac: {
    method: 'put',
    url: '/templates/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getSyslogPolicyList: {
    method: 'post',
    url: '/templates/syslogServerProfiles/query',
    newApi: true
  },
  getVenueSyslogSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/syslogServerProfileSettings',
    newApi: true
  },
  updateVenueSyslogSettings: {
    method: 'post',
    url: '/templates/venues/:venueId/syslogServerProfileSettings',
    opsApi: 'POST:/templates/venues/{id}/syslogServerProfileSettings',
    newApi: true
  },
  querySyslog: {
    method: 'post',
    url: '/templates/syslogServerProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindVenueSyslog: {
    method: 'PUT',
    url: '/templates/venues/:venueId/syslogServerProfiles/:policyId',
    opsApi: 'PUT:/templates/venues/{id}/syslogServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  unbindVenueSyslog: {
    method: 'delete',
    url: '/templates/venues/:venueId/syslogServerProfiles/:policyId',
    opsApi: 'DELETE:/templates/venues/{id}/syslogServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addRoguePolicy: {
    method: 'post',
    url: '/templates/rogueApPolicyProfiles',
    newApi: true
  },
  getRoguePolicy: {
    method: 'get',
    url: '/templates/rogueApPolicyProfiles/:policyId',
    newApi: true
  },
  getEnhancedRoguePolicyList: {
    method: 'post',
    url: '/templates/rogueApPolicyProfiles/query',
    newApi: true
  },
  updateRoguePolicy: {
    method: 'put',
    url: '/templates/rogueApPolicyProfiles/:policyId',
    newApi: true
  },
  deleteRogueApPolicy: {
    method: 'delete',
    url: '/templates/rogueApPolicyProfiles/:templateId',
    newApi: true
  },
  getVenueRogueAp: {
    method: 'get',
    url: '/templates/venues/:venueId/rogueApSettings',
    newApi: true
  },
  updateVenueRogueAp: {
    method: 'put',
    url: '/templates/venues/:venueId/rogueApSettings',
    newApi: true
  },
  getRoguePolicyListRbac: {
    method: 'post',
    url: '/templates/roguePolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addRoguePolicyRbac: {
    method: 'post',
    url: '/templates/roguePolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getRoguePolicyRbac: {
    method: 'get',
    url: '/templates/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateRoguePolicyRbac: {
    method: 'put',
    url: '/templates/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteRoguePolicyRbac: {
    method: 'delete',
    url: '/templates/roguePolicies/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateRoguePolicy: {
    method: 'put',
    url: '/templates/venues/:venueId/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateRoguePolicy: {
    method: 'delete',
    url: '/templates/venues/:venueId/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueRogueApRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/roguePolicySettings',
    opsApi: 'GET:/templates/venues/{id}/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueRogueApRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/roguePolicySettings',
    opsApi: 'PUT:/templates/venues/{id}/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addVlanPoolPolicyRbac: {
    method: 'post',
    url: '/templates/vlanPoolProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVlanPoolPolicyRbac: {
    method: 'get',
    url: '/templates/vlanPoolProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVlanPoolPolicyRbac: {
    method: 'put',
    url: '/templates/vlanPoolProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteVlanPoolPolicyRbac: {
    method: 'delete',
    url: '/templates/vlanPoolProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateVlanPool: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVlanPool: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApGroupVlanPool: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApGroupVlanPool: {
    method: 'delete',
    // eslint-disable-next-line max-len
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL2AclOnAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL2AclOnAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:policyId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL2AclOnWifiNetwork: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL2AclOnWifiNetwork: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/l2AclPolicies/:l2AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL3AclOnAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL3AclOnAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:policyId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateL3AclOnWifiNetwork: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateL3AclOnWifiNetwork: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/l3AclPolicies/:l3AclPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateDevicePolicyOnAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateDevicePolicyOnAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:policyId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateDevicePolicyOnWifiNetwork: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateDevicePolicyOnWifiNetwork: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/devicePolicies/:devicePolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApplicationPolicyOnAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApplicationPolicyOnAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:policyId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApplicationPolicyOnWifiNetwork: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApplicationPolicyOnWifiNetwork: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/applicationPolicies/:applicationPolicyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateAccessControlProfileOnWifiNetwork: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/accessControlProfiles/:accessControlProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateAccessControlProfileOnWifiNetwork: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/accessControlProfiles/:accessControlProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  // Ethernet Port Profile
  createEthernetPortProfile: {
    method: 'post',
    url: '/templates/ethernetPortProfiles',
    opsApi: 'POST:/templates/ethernetPortProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortProfileViewDataList: {
    method: 'post',
    url: '/templates/ethernetPortProfiles/query',
    opsApi: 'POST:/templates/ethernetPortProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteEthernetPortProfile: {
    method: 'delete',
    url: '/templates/ethernetPortProfiles/:templateId',
    opsApi: 'DELETE:/templates/ethernetPortProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortProfile: {
    method: 'get',
    url: '/templates/ethernetPortProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortProfile: {
    method: 'put',
    url: '/templates/ethernetPortProfiles/:id',
    opsApi: 'PUT:/templates/ethernetPortProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortSettingsByVenueApModel: {
    method: 'get',
    url: '/templates/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortSettingsByVenueApModel: {
    method: 'put',
    url: '/templates/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateEthernetPortProfileOnVenueApModelPortId: {
    method: 'put',
    url: '/templates/venues/:venueId/apModels/:apModel/lanPorts/:portId/ethernetPortProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  }
}
