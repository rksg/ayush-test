import { ApiInfo } from '@acx-ui/utils'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  deleteSyslogPolicies: {
    method: 'delete',
    url: '/syslogServerProfiles',
    oldUrl: '/api/syslogServerProfiles',
    newApi: true
  },
  addSyslogPolicy: {
    method: 'post',
    url: '/syslogServerProfiles',
    oldUrl: '/api/syslogServerProfiles',
    newApi: true
  },
  getSyslogPolicy: {
    method: 'get',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  getSyslogPolicyList: {
    method: 'get',
    url: '/syslogServerProfiles',
    oldUrl: '/api/syslogServerProfiles',
    newApi: true
  },
  getVenueSyslogAp: {
    method: 'get',
    url: '/venues/:venueId/syslogServerProfileSettings',
    oldUrl: '/api/venues/:venueId/syslogServerProfileSettings',
    newApi: true
  },
  updateVenueSyslogAp: {
    method: 'post',
    url: '/venues/:venueId/syslogServerProfileSettings',
    oldUrl: '/api/venues/:venueId/syslogServerProfileSettings',
    newApi: true
  },
  getVenueSyslogList: {
    method: 'post',
    url: '/venues/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue',
    newApi: true
  },
  syslogPolicyList: {
    method: 'post',
    url: '/enhancedSyslogServerProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedSyslogServerProfiles/query',
    newApi: true
  }
}
