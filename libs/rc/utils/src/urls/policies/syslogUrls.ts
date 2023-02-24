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
  getSyslogPolicy: {
    method: 'get',
    url: '/api/syslogServerProfiles/:policyId'
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/api/syslogServerProfiles/:policyId'
  },
  getSyslogPolicyList: {
    method: 'get',
    url: '/api/syslogServerProfiles'
  },
  getVenueSyslogPolicy: {
    method: 'post',
    url: '/api/venues/:tenantId/syslogServerProfileSettings'
  },
  getVenueSyslogList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  }
}
