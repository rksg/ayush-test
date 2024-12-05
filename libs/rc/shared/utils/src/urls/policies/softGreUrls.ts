import { ApiInfo } from '@acx-ui/utils'
// TODO jean - all urls
export const SoftGreUrls: { [key: string]: ApiInfo } = {
  createSoftGre: {
    method: 'post',
    url: '/softGreProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSoftGreViewDataList: {
    method: 'post',
    url: '/softGreProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSoftGre: {
    method: 'delete',
    url: '/softGreProfiles/:policyId',
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
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/softGreProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}