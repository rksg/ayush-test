import { ApiInfo } from '@acx-ui/utils'

export const EdgeQosUrls: { [key: string]: ApiInfo } = {
  getEdgeQos: {
    method: 'get',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  addEdgeQos: {
    method: 'post',
    url: '/edgeQosProfiles',
    newApi: true
  },
  updateEdgeQos: {
    method: 'put',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  deleteEdgeQos: {
    method: 'delete',
    url: '/edgeQosProfiles/:qosProfileId',
    newApi: true
  },
  getEdgeQosViewDataList: {
    method: 'post',
    url: '/edgeQosProfiles/query',
    newApi: true
  }
}