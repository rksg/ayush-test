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
    newApi: true
  },
  updateApGroup: {
    method: 'put',
    url: '/templates/venues/apGroups/:apGroupId',
    newApi: true
  },
  deleteApGroups: {
    method: 'delete',
    url: '/templates/venues/apGroups',
    newApi: true
  },
  getApGroup: {
    method: 'get',
    url: '/templates/venues/apGroups/:apGroupId',
    newApi: true
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
  }
}
