import { ApiInfo } from '../../apiService'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/api/syslogServerProfiles/:policyId'
  },
  deleteSyslogPolicies: {
    method: 'delete',
    url: '/api/syslogServerProfiles'
  },
  addSyslogPolicy: {
    method: 'post',
    url: '/api/syslogServerProfiles'
  },
  getSyslogPolicy: { // detail
    method: 'get',
    url: '/api/syslogServerProfiles/:policyId'
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/api/syslogServerProfiles/:policyId'
  },
  getSyslogPolicyList: { // scop form
    method: 'get',
    url: '/api/syslogServerProfiles'
  },
  getVenueSyslogAp: { //instances
    method: 'get',
    url: '/api/venues/:venueId/syslogServerProfileSettings'
  },
  updateVenueSyslogAp: { //instances
    method: 'post',
    url: '/api/venues/:venueId/syslogServerProfileSettings'
  },
  getVenueSyslogList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  },
  syslogPolicyList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/enhancedSyslogServerProfiles/query'
  }
}
