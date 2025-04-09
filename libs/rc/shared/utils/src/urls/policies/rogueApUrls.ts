import { ApiInfo } from '@acx-ui/utils'

export const RogueApUrls: { [key: string]: ApiInfo } = {
  deleteRogueApPolicy: {
    method: 'delete',
    url: '/rogueApPolicyProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId',
    newApi: true
  },
  deleteRogueApPolicies: {
    method: 'delete',
    url: '/rogueApPolicyProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles',
    newApi: true
  },
  addRoguePolicy: {
    method: 'post',
    url: '/rogueApPolicyProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles',
    newApi: true
  },
  getRoguePolicy: {
    method: 'get',
    url: '/rogueApPolicyProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId',
    newApi: true
  },
  updateRoguePolicy: {
    method: 'put',
    url: '/rogueApPolicyProfiles/:policyId',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId',
    newApi: true
  },
  getRoguePolicyList: {
    method: 'get',
    url: '/rogueApPolicyProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles',
    newApi: true
  },
  getVenueRoguePolicy: {
    method: 'post',
    url: '/venues/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue',
    newApi: true
  },
  getEnhancedRoguePolicyList: {
    method: 'post',
    url: '/enhancedRogueApPolicyProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedRogueApPolicyProfiles/query',
    newApi: true
  },
  getRoguePolicyListRbac: {
    method: 'post',
    url: '/roguePolicies/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addRoguePolicyRbac: {
    method: 'post',
    url: '/roguePolicies',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getRoguePolicyRbac: {
    method: 'get',
    url: '/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateRoguePolicyRbac: {
    method: 'put',
    url: '/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteRoguePolicyRbac: {
    method: 'delete',
    url: '/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateRoguePolicy: {
    method: 'put',
    url: '/venues/:venueId/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/venues/{id}/roguePolicies/{id}'
  },
  deactivateRoguePolicy: {
    method: 'delete',
    url: '/venues/:venueId/roguePolicies/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/venues/{id}/roguePolicies/{id}'
  }
}
