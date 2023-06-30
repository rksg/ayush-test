import { ApiInfo } from '@acx-ui/utils'


export const ApSnmpUrls: { [key: string]: ApiInfo } = {
  deleteApSnmpPolicy: {
    method: 'delete',
    url: '/apSnmpAgentProfiles/:policyId',
    oldUrl: '/api/apSnmpAgentProfiles/:policyId',
    newApi: true
  },
  deleteApSnmpPolicies: {
    method: 'delete',
    url: '/apSnmpAgentProfiles',
    oldUrl: '/api/apSnmpAgentProfiles',
    newApi: true
  },
  addApSnmpPolicy: {
    method: 'post',
    url: '/apSnmpAgentProfiles',
    oldUrl: '/api/apSnmpAgentProfiles',
    newApi: true
  },
  getApUsageByApSnmpPolicy: { // detail
    method: 'post',
    url: '/apSnmpAgentProfiles/:policyId/aps/query',
    oldUrl: '/api/apSnmpAgentProfiles/:policyId/aps/query',
    newApi: true
  },
  getApSnmpPolicy: {
    method: 'get',
    url: '/apSnmpAgentProfiles/:policyId',
    oldUrl: '/api/apSnmpAgentProfiles/:policyId',
    newApi: true
  },
  updateApSnmpPolicy: {
    method: 'put',
    url: '/apSnmpAgentProfiles/:policyId',
    oldUrl: '/api/apSnmpAgentProfiles/:policyId',
    newApi: true
  },
  getApSnmpPolicyList: {
    method: 'get',
    url: '/apSnmpAgentProfiles',
    oldUrl: '/api/apSnmpAgentProfiles',
    newApi: true
  },
  getVenueApSnmpSettings: { //venue instances
    method: 'get',
    url: '/venues/:venueId/snmpAgentSettings',
    oldUrl: '/api/venues/:venueId/snmpAgentSettings',
    newApi: true
  },
  updateVenueApSnmpSettings: { //venue instances
    method: 'put',
    url: '/venues/:venueId/snmpAgentSettings',
    oldUrl: '/api/venues/:venueId/snmpAgentSettings',
    newApi: true
  },
  getApSnmpSettings: { //ap instances
    method: 'get',
    url: '/venues/aps/:serialNumber/snmpAgentSettings',
    oldUrl: '/api/venues/aps/:serialNumber/snmpAgentSettings',
    newApi: true
  },
  updateApSnmpSettings: { //ap instances
    method: 'put',
    url: '/venues/aps/:serialNumber/snmpAgentSettings',
    oldUrl: '/api/venues/aps/:serialNumber/snmpAgentSettings',
    newApi: true
  },
  resetApSnmpSettings: { //ap instances - use venue setting
    method: 'delete',
    url: '/venues/aps/:serialNumber/snmpAgentSettings',
    oldUrl: '/api/venues/aps/:serialNumber/snmpAgentSettings',
    newApi: true
  },
  getApSnmpFromViewModel: {
    method: 'post',
    url: '/snmpAgents/query',
    oldUrl: '/api/snmpAgents/query',
    newApi: true
  }
}
