import { ApiInfo } from '../../apiService'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  addSyslogPolicy: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles'
  },
  getSyslogPolicy: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogueApPolicyProfiles/:policyId'
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
