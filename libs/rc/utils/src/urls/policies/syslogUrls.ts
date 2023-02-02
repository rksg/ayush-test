import { ApiInfo } from '../../apiService'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles/:policyId'
  },
  deleteSyslogPolicies: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles'
  },
  addSyslogPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles'
  },
  getSyslogPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles/:policyId'
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles/:policyId'
  },
  getSyslogPolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles'
  },
  getVenueSyslogPolicy: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  }
}
