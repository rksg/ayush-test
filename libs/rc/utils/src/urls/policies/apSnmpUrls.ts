import { ApiInfo } from '../../apiService'


export const ApSnmpUrls: { [key: string]: ApiInfo } = {
  deleteApSnmpProfile: {
    method: 'delete',
    url: '/api//apSnmpAgentProfiles/:policyId'
  },
  deleteApSnmpPolicies: {
    method: 'delete',
    url: '/api/apSnmpAgentProfiles'
  },
  addApSnmpPolicy: {
    method: 'post',
    url: '/api/apSnmpAgentProfiles'
  },
  getApUsageByApSnmpProfile: { // detail
    method: 'post',
    url: '/api/apSnmpAgentProfiles/:policyId/aps/query'
  },
  getApSnmpPolicy: {
    method: 'get',
    url: '/api/apSnmpAgentProfiles/:policyId'
  },
  updateApSnmpPolicy: {
    method: 'put',
    url: '/api/apSnmpAgentProfiles/:policyId'
  },
  getApSnmpPolicyList: { // scop form
    method: 'get',
    url: '/api/apSnmpAgentProfiles'
  },
  getVenueApSnmpSettings: { //venue instances
    method: 'get',
    url: '/api/venues/:venueId/snmpAgentSettings'
  },
  updateVenueApSnmpSettings: { //venue instances
    method: 'put',
    url: '/api/venues/:venueId/snmpAgentSettings'
  },
  getApSnmpSettings: { //ap instances
    method: 'get',
    url: '/api/venues/aps/:serialNumber/snmpAgentSettings'
  },
  updateApSnmpSettings: { //ap instances
    method: 'put',
    url: '/api/venues/aps/:serialNumber/snmpAgentSettings'
  },
  resetApSnmpSettings: { //ap instances - use venue setting
    method: 'delete',
    url: '/api/venues/aps/:serialNumber/snmpAgentSettings'
  },
  getApSnmpFromViewModel: {
    method: 'post',
    url: '/api/snmpAgents'
  }
}
