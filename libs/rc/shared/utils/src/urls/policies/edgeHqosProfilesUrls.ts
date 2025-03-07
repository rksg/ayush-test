import { ApiInfo } from '@acx-ui/utils'

export const EdgeHqosProfilesUrls: { [key: string]: ApiInfo } = {
  getEdgeHqosProfileById: {
    method: 'get',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  addEdgeHqosProfile: {
    method: 'post',
    url: '/edgeHqosProfiles',
    newApi: true,
    opsApi: 'POST:/edgeHqosProfiles'
  },
  updateEdgeHqosProfile: {
    method: 'put',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true,
    opsApi: 'PUT:/edgeHqosProfiles/{id}'
  },
  deleteEdgeHqosProfile: {
    method: 'delete',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true,
    opsApi: 'DELETE:/edgeHqosProfiles/{id}'
  },
  getEdgeHqosProfileViewDataList: {
    method: 'post',
    url: '/edgeHqosProfiles/query',
    newApi: true,
    opsApi: 'POST:/edgeHqosProfiles/query'
  },
  activateEdgeCluster: {
    method: 'put',
    url: '/edgeHqosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    opsApi: 'PUT:/edgeHqosProfiles/{id}/venues/{id}/edgeClusters/{id}'
  },
  deactivateEdgeCluster: {
    method: 'delete',
    url: '/edgeHqosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    opsApi: 'DELETE:/edgeHqosProfiles/{id}/venues/{id}/edgeClusters/{id}'
  }
}