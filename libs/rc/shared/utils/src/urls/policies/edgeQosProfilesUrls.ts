import { ApiInfo } from '@acx-ui/utils'

export const EdgeQosProfilesUrls: { [key: string]: ApiInfo } = {
  getEdgeQosProfileById: {
    method: 'get',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  addEdgeQosProfile: {
    method: 'post',
    url: '/edgeQosProfiles',
    newApi: true
  },
  updateEdgeQosProfile: {
    method: 'put',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  deleteEdgeQosProfile: {
    method: 'delete',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  getEdgeQosProfileViewDataList: {
    method: 'post',
    url: '/edgeQosProfiles/query',
    newApi: true
  }
}