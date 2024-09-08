import { ApiInfo } from '@acx-ui/utils'

export const EdgeQosProfilesUrls: { [key: string]: ApiInfo } = {
  getEdgeQosProfileById: {
    method: 'get',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  addEdgeQosProfile: {
    method: 'post',
    url: '/edgeHqosProfiles',
    newApi: true
  },
  updateEdgeQosProfile: {
    method: 'put',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  deleteEdgeQosProfile: {
    method: 'delete',
    url: '/edgeHqosProfiles/:policyId',
    newApi: true
  },
  getEdgeQosProfileViewDataList: {
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