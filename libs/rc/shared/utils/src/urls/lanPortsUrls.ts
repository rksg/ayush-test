import { ApiInfo } from '@acx-ui/utils'

export const LanPortsUrls: { [key: string]: ApiInfo } = {
  getVenueLanPortSettings: {
    method: 'get',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueLanPortSettings: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApLanPortSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateAPLanPortsettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPorts/:portId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}