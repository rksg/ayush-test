import { ApiInfo } from '@acx-ui/utils'

export const ConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getConfigTemplates: {
    method: 'post',
    url: '/templates/query',
    newApi: true
  },
  getConfigTemplatesRbac: {
    method: 'post',
    url: '/templates/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/query'
  },
  applyConfigTemplate: {
    method: 'post',
    url: '/templates/:templateId/tenant/:tenantId',
    newApi: true
  },
  applyConfigTemplateRbac: {
    method: 'post',
    url: '/templates/:templateId/tenants/:tenantId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/{id}/tenants/{id}'
  },
  addNetworkTemplate: {
    method: 'post',
    url: '/templates/networks',
    newApi: true
  },
  addNetworkTemplateRbac: {
    method: 'post',
    url: '/templates/wifiNetworks',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/templates/wifiNetworks'
  },
  updateNetworkTemplate: {
    method: 'put',
    url: '/templates/networks/:networkId',
    newApi: true
  },
  updateNetworkTemplateRbac: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/templates/wifiNetworks/{id}'
  },
  getNetworkTemplate: {
    method: 'get',
    url: '/templates/networks/:networkId',
    newApi: true
  },
  getNetworkTemplateRbac: {
    method: 'get',
    url: '/templates/wifiNetworks/:networkId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  deleteNetworkTemplate: {
    method: 'delete',
    url: '/templates/networks/:templateId',
    newApi: true
  },
  deleteNetworkTemplateRbac: {
    method: 'delete',
    url: '/templates/wifiNetworks/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/templates/wifiNetworks/{id}'
  },
  getNetworkTemplateList: {
    method: 'post',
    url: '/templates/networks/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getNetworkTemplateListRbac: {
    method: 'post',
    url: '/templates/wifiNetworks/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueNetworkTemplateList: {
    method: 'post',
    url: '/templates/venues/:venueId/networks/query',
    newApi: true
  },
  addAAAPolicyTemplate: {
    method: 'post',
    url: '/templates/radiusServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addAAAPolicyTemplateRbac: {
    method: 'post',
    url: '/templates/radiusServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAAAPolicyTemplate: {
    method: 'get',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getAAAPolicyTemplateRbac: {
    method: 'get',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteAAAPolicyTemplate: {
    method: 'delete',
    url: '/templates/radiusServerProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  deleteAAAPolicyTemplateRbac: {
    method: 'delete',
    url: '/templates/radiusServerProfiles/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAAAPolicyTemplate: {
    method: 'put',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateAAAPolicyTemplateRbac: {
    method: 'put',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAAAPolicyTemplateList: {
    method: 'post',
    url: '/templates/radiusServerProfiles/query',
    newApi: true
  },
  queryAAAPolicyTemplateList: {
    method: 'post',
    url: '/templates/radiusServerProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateRadiusServer: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateRadiusServer: {
    method: 'delete',
    url: '/templates/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateRadiusServerSettings: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getRadiusServerSettings: {
    method: 'get',
    url: '/templates/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenuesTemplateList: {
    method: 'post',
    url: '/templates/venues/query',
    newApi: true
  },
  getVenuesTemplateListRbac: {
    method: 'post',
    url: '/templates/venues/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addNetworkVenueTemplate: {
    method: 'post',
    url: '/templates/networkActivations',
    newApi: true
  },
  addNetworkVenueTemplateRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId',
    opsApi: 'PUT:/templates/venues/{id}/wifiNetworks/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteNetworkVenueTemplate: {
    method: 'delete',
    url: '/templates/networkActivations/:networkVenueId',
    newApi: true
  },
  deleteNetworkVenueTemplateRbac: {
    method: 'delete',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId',
    opsApi: 'DELETE:/templates/venues/{id}/wifiNetworks/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteNetworkVenuesTemplate: {
    method: 'delete',
    url: '/templates/networkActivations',
    newApi: true
  },
  updateNetworkVenueTemplate: {
    method: 'put',
    url: '/templates/networkActivations/:networkVenueId?quickAck=true',
    newApi: true
  },
  updateNetworkVenueTemplateRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/settings',
    opsApi: 'PUT:/templates/venues/{id}/wifiNetworks/{id}/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateVenueApGroupRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVenueApGroupRbac: {
    method: 'delete',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueApGroupsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true
  },
  updateVenueApGroupsRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getNetworkVenueTemplateRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiNetworks/:networkId/settings',
    newApi: true
  },
  getNetworkVenuesTemplateRbac: {
    method: 'post',
    url: '/templates/venues/wifiNetworks/query',
    newApi: true
  },
  addNetworkVenuesTemplate: {
    method: 'post',
    url: '/templates/networkActivations/mappings',
    newApi: true
  },
  updateNetworkVenuesTemplate: {
    method: 'put',
    url: '/templates/networkActivations/mappings',
    newApi: true
  },
  getDriftTenants: {
    method: 'get',
    url: '/templates/:templateId/driftTenants?page=1&pageSize=1000',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getDriftReport: {
    method: 'get',
    url: '/templates/:templateId/tenants/:tenantId/diffReports',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'GET:/templates/{id}/tenants/{id}/diffReports'
  },
  patchDriftReport: {
    method: 'PATCH',
    url: '/templates/:templateId/tenants/:tenantId/diffReports',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PATCH:/templates/{id}/tenants/{id}/diffReports'
  },
  updateEnforcement: {
    method: 'put',
    url: '/templates/:templateId/enforcementSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/templates/{id}/enforcementSettings'
  }
}
