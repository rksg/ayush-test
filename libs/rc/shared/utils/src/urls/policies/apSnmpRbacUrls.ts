import { ApiInfo } from '@acx-ui/utils'


export const ApSnmpRbacUrls: { [key: string]: ApiInfo } = {
  addApSnmpPolicy: {
    method: 'post',
    url: '/snmpAgentProfiles',
    newApi: true
  },
  getApUsageByApSnmpPolicy: { // detail
    method: 'post',
    url: '/snmpAgentProfiles/query',
    newApi: true
  },
  getApSnmpPolicy: {
    method: 'get',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  updateApSnmpPolicy: {
    method: 'put',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  deleteApSnmpPolicy: {
    method: 'delete',
    url: '/snmpAgentProfiles/:profileId',
    newApi: true
  },
  deleteApSnmpPolicies: { // no RBAC replacement
    method: '',
    url: '',
    newApi: true
  },
  // getApSnmpPolicyList: {
  //   method: 'get',
  //   url: '/apSnmpAgentProfiles',
  //   newApi: true
  // },
  // getVenueApSnmpSettings: { //venue instances
  //   method: 'get',
  //   url: '/venues/:venueId/snmpAgentSettings',
  //   newApi: true
  // },
  // updateVenueApSnmpSettings: { //venue instances
  //   method: 'put',
  //   url: '/venues/:venueId/snmpAgentSettings',
  //   newApi: true
  // },
  // getApSnmpSettings: { //ap instances
  //   method: 'get',
  //   url: '/venues/aps/:serialNumber/snmpAgentSettings',
  //   newApi: true
  // },
  // updateApSnmpSettings: { //ap instances
  //   method: 'put',
  //   url: '/venues/aps/:serialNumber/snmpAgentSettings',
  //   newApi: true
  // },
  // resetApSnmpSettings: { //ap instances - use venue setting
  //   method: 'delete',
  //   url: '/venues/aps/:serialNumber/snmpAgentSettings',
  //   newApi: true
  // },
  getApSnmpFromViewModel: {
    method: 'post',
    url: '/snmpAgentProfiles/query',
    newApi: true
  }
}
