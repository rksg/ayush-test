import { ApiInfo } from '@acx-ui/utils'

export const EthernetPortProfileUrls: { [key: string]: ApiInfo } = {
  createEthernetPortProfile: {
    method: 'post',
    url: '/ethernetPortProfiles',
    opsApi: 'POST:/ethernetPortProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortProfileViewDataList: {
    method: 'post',
    url: '/ethernetPortProfiles/query',
    opsApi: 'POST:/ethernetPortProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteEthernetPortProfile: {
    method: 'delete',
    url: '/ethernetPortProfiles/:id',
    opsApi: 'DELETE:/ethernetPortProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortProfile: {
    method: 'get',
    url: '/ethernetPortProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortProfile: {
    method: 'put',
    url: '/ethernetPortProfiles/:id',
    opsApi: 'PUT:/ethernetPortProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortProfileRadiusId: {
    method: 'put',
    url: '/ethernetPortProfiles/:id/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  deleteEthernetPortProfileRadiusId: {
    method: 'delete',
    url: '/ethernetPortProfiles/:id/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getEthernetPortSettingsByVenueApModel: {
    method: 'get',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortSettingsByVenueApModel: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateEthernetPortProfileOnVenueApModelPortId: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/ethernetPortProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateEthernetPortOverwritesByApPortId: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateEthernetPortProfileOnApPortId: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/ethernetPortProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  }
}