import { ApiInfo } from '@acx-ui/utils'

export const SyslogUrls: { [key: string]: ApiInfo } = {
  deleteSyslogPolicy: {
    method: 'delete',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  deleteSyslogPolicyRbac: {
    method: 'delete',
    url: '/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  addSyslogPolicyRbac: {
    method: 'post',
    url: '/syslogServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getSyslogPolicy: {
    method: 'get',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  getSyslogPolicyRbac: {
    method: 'get',
    url: '/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateSyslogPolicy: {
    method: 'put',
    url: '/syslogServerProfiles/:policyId',
    oldUrl: '/api/syslogServerProfiles/:policyId',
    newApi: true
  },
  updateSyslogPolicyRbac: {
    method: 'put',
    url: '/syslogServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  getVenueSyslogListRbac: {
    method: 'post',
    url: '/venues/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  syslogPolicyList: {
    method: 'post',
    url: '/enhancedSyslogServerProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedSyslogServerProfiles/query',
    newApi: true
  },
  querySyslog: {
    method: 'post',
    url: '/syslogServerProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindVenueSyslog: {
    method: 'PUT',
    url: '/venues/:venueId/syslogServerProfiles/:policyId',
    opsApi: 'PUT:/venues/{id}/syslogServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  unbindVenueSyslog: {
    method: 'delete',
    url: '/venues/:venueId/syslogServerProfiles/:policyId',
    opsApi: 'DELETE:/venues/{id}/syslogServerProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
