import { ApiInfo } from '@acx-ui/utils'
// TODO jean - all urls
export const IpsecUrls: { [key: string]: ApiInfo } = {
  createIpsec: {
    method: 'post',
    url: '/ipsecProfiles',
    opsApi: 'POST:/ipsecProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getIpsecViewDataList: {
    method: 'post',
    url: '/ipsecProfiles/query',
    opsApi: 'POST:/ipsecProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteIpsec: {
    method: 'delete',
    url: '/ipsecProfiles/:policyId',
    opsApi: 'DELETE:/ipsecProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getIpsec: {
    method: 'get',
    url: '/ipsecProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateIpsec: {
    method: 'put',
    url: '/ipsecProfiles/:policyId',
    opsApi: 'PUT:/ipsecProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateIpsec: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateIpsec: {
    method: 'delete',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/wifiNetworks/:networkId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateIpsecOnVenueLanPort: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateIpsecOnVenueLanPort: {
    method: 'delete',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateIpsecOnApLanPort: {
    method: 'put',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateIpsecOnApLanPort: {
    method: 'delete',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/softGreProfiles/:softGreProfileId/ipsecProfiles/:ipsecProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}