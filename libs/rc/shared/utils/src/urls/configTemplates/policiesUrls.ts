import { ApiInfo } from '@acx-ui/utils'

export const PoliciesConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  addL2AclPolicy: {
    method: 'post',
    url: '/templates/l2AclPolicies',
    newApi: true
  },
  getL2AclPolicy: {
    method: 'get',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true
  },
  getEnhancedL2AclPolicies: {
    method: 'post',
    url: '/templates/l2AclPolicies/query',
    newApi: true
  },
  delL2AclPolicy: {
    method: 'delete',
    url: '/templates/l2AclPolicies/:templateId',
    newApi: true
  },
  updateL2AclPolicy: {
    method: 'put',
    url: '/templates/l2AclPolicies/:l2AclPolicyId',
    newApi: true
  },
  addL3AclPolicy: {
    method: 'post',
    url: '/templates/l3AclPolicies',
    newApi: true
  },
  getL3AclPolicy: {
    method: 'get',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true
  },
  getEnhancedL3AclPolicies: {
    method: 'post',
    url: '/templates/l3AclPolicies/query',
    newApi: true
  },
  delL3AclPolicy: {
    method: 'delete',
    url: '/templates/l3AclPolicies/:templateId',
    newApi: true
  },
  updateL3AclPolicy: {
    method: 'put',
    url: '/templates/l3AclPolicies/:l3AclPolicyId',
    newApi: true
  },
  addAppPolicy: {
    method: 'post',
    url: '/templates/applicationPolicies',
    newApi: true
  },
  getAppPolicy: {
    method: 'get',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true
  },
  getEnhancedApplicationPolicies: {
    method: 'post',
    url: '/templates/applicationPolicies/query',
    newApi: true
  },
  delAppAclPolicy: {
    method: 'delete',
    url: '/templates/applicationPolicies/:templateId',
    newApi: true
  },
  updateAppAclPolicy: {
    method: 'put',
    url: '/templates/applicationPolicies/:applicationPolicyId',
    newApi: true
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
    newApi: true
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
  addAccessControlProfile: {
    method: 'post',
    url: '/templates/accessControlProfiles',
    newApi: true
  },
  updateAccessControlProfile: {
    method: 'put',
    url: '/templates/accessControlProfiles/:policyId',
    newApi: true
  },
  deleteAccessControlProfile: {
    method: 'delete',
    url: '/templates/accessControlProfiles/:templateId',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile/:policyId',
    newApi: true
  },
  addDevicePolicy: {
    method: 'post',
    url: '/templates/devicePolicies',
    newApi: true
  },
  getDevicePolicy: {
    method: 'get',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true
  },
  delDevicePolicy: {
    method: 'delete',
    url: '/templates/devicePolicies/:templateId',
    newApi: true
  },
  updateDevicePolicy: {
    method: 'put',
    url: '/templates/devicePolicies/:devicePolicyId',
    newApi: true
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
  getEnhancedVlanPools: {
    method: 'post',
    url: '/templates/enhancedVlanPoolProfiles/query',
    newApi: true
  },
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/templates/syslogServerProfiles/:templateId',
    newApi: true
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
    newApi: true
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
    newApi: true
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
    newApi: true
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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  unbindVenueSyslog: {
    method: 'delete',
    url: '/templates/venues/:venueId/syslogServerProfiles/:policyId',
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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueRogueApRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/roguePolicySettings',
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
    url: '/templates/vlanPoolProfiles/:policyId',
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
  }
}
