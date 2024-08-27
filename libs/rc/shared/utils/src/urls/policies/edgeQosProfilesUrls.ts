import { ApiInfo } from '@acx-ui/utils'

export const EdgeQosProfilesUrls: { [key: string]: ApiInfo } = {
  getEdgeQosProfileById: {
    method: 'get',
    url: '/edgeQosProfiles/:policyId',
    newApi: true
  },
  addEdgeQosProfile: {
    method: 'post',
    url: '/edgeQosProfiles',
    newApi: true
  },
  updateEdgeQosProfile: {
    method: 'put',
    url: '/edgeQosProfiles/:policyId',
    newApi: true
  },
  deleteEdgeQosProfile: {
    method: 'delete',
    url: '/edgeQosProfiles/:policyId',
    newApi: true
  },
  getEdgeQosProfileViewDataList: {
    method: 'post',
    url: '/edgeQosProfiles/query',
    newApi: true
  },
  activateEdgeCluster: {
    method: 'put',
    url: '/edgeQosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  },
  deactivateEdgeCluster: {
    method: 'delete',
    url: '/edgeQosProfiles/:policyId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  }
}