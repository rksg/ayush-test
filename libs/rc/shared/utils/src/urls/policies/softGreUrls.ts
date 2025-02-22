import { ApiInfo } from '@acx-ui/utils'
// TODO jean - all urls
export const SoftGreUrls: { [key: string]: ApiInfo } = {
  createSoftGre: {
    method: 'post',
    url: '/softGreProfiles',
    opsApi: 'POST:/softGreProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSoftGreViewDataList: {
    method: 'post',
    url: '/softGreProfiles/query',
    opsApi: 'POST:/softGreProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSoftGre: {
    method: 'delete',
    url: '/softGreProfiles/:policyId',
    opsApi: 'DELETE:/softGreProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSoftGre: {
    method: 'get',
    url: '/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateSoftGre: {
    method: 'put',
    url: '/softGreProfiles/:policyId',
    opsApi: 'PUT:/softGreProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateSoftGre: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  dectivateSoftGre: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateSoftGreProfileOnVenue: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateSoftGreProfileOnVenue: {
    method: 'delete',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSoftGreProfileConfigurationOnVenue: {
    method: 'get',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateSoftGreProfileOnAP: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateSoftGreProfileOnAP: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSoftGreProfileConfigurationOnAP: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
