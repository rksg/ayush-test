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
    }
  },
  applyConfigTemplate: {
    method: 'post',
    url: '/templates/:templateId/tenant/:tenantId',
    newApi: true
  },
  applyConfigTemplateRbac: {
    method: 'post',
    url: '/templates/:templateId/tenant/:tenantId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
    }
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
    }
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
    }
  },
  getNetworkTemplateList: {
    method: 'post',
    url: '/templates/networks/query',
    newApi: true
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
    newApi: true
  },
  getAAAPolicyTemplate: {
    method: 'get',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true
  },
  deleteAAAPolicyTemplate: {
    method: 'delete',
    url: '/templates/radiusServerProfiles/:templateId',
    newApi: true
  },
  updateAAAPolicyTemplate: {
    method: 'put',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true
  },
  getAAAPolicyTemplateList: {
    method: 'post',
    url: '/templates/radiusServerProfiles/query',
    newApi: true
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
  deleteNetworkVenueTemplate: {
    method: 'delete',
    url: '/templates/networkActivations/:networkVenueId',
    newApi: true
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
  addNetworkVenuesTemplate: {
    method: 'post',
    url: '/templates/networkActivations/mappings',
    newApi: true
  },
  updateNetworkVenuesTemplate: {
    method: 'put',
    url: '/templates/networkActivations/mappings',
    newApi: true
  }
}
