import { ApiInfo } from '../../apiService'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  getSyslogPolicyList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/syslogServerProfiles'
  }
}
