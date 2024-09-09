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
    newApi: true
  },
  updateEdgeHqosProfile: {
    method: 'put',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  deleteEdgeHqosProfile: {
    method: 'delete',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  getEdgeHqosProfileViewDataList: {
    method: 'post',
    url: '/edgeHqosProfiles/query',
    newApi: true
  },
  activateEdgeCluster: {
    method: 'put',
    url: '/edgeHqosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  },
  deactivateEdgeCluster: {
    method: 'delete',
    url: '/edgeHqosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  }
}