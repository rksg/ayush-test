import { ApiInfo } from '@acx-ui/utils'

export const ApGroupConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/templates/venues/:venueId/apGroups',
    newApi: true
  },
  addApGroup: {
    method: 'post',
    url: '/templates/venues/:venueId/apGroups',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'POST:/templates/venues/{id}/apGroups'
  },
  updateApGroup: {
    method: 'put',
    url: '/templates/venues/apGroups/:apGroupId',
    newApi: true
  },
  updateApGroupRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/templates/venues/{id}/apGroups/{id}'
  },
  deleteApGroup: {
    method: 'delete',
    url: '/templates/venues/apGroups/:templateId',
    newApi: true
  },
  deleteApGroupRbac: {
    method: 'delete',
    url: '/templates/venues/:venueId/apGroups/:templateId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/templates/venues/{id}/apGroups/{id}'
  },
  getApGroup: {
    method: 'get',
    url: '/templates/venues/apGroups/:apGroupId',
    newApi: true
  },
  getApGroupRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApGroupNetworkList: {
    method: 'post',
    url: '/templates/apGroups/:apGroupId/networks/query',
    newApi: true
  },
  networkActivations: {
    method: 'post',
    url: '/templates/networkActivations/query',
    newApi: true
  },
  getApGroupsList: {
    method: 'post',
    url: '/templates/apGroups/query',
    newApi: true
  },
  getApGroupsListRbac: {
    method: 'post',
    url: '/templates/venues/apGroups/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApGroupDefaultRegulatoryChannels: {
    method: 'get',
    url: '/templates/venues/:venueId/apGroups/:apGroupId/wifiAvailableChannels',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
