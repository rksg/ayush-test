import { ApiInfo } from '@acx-ui/utils'

export const EdgeSdLanUrls: { [key: string]: ApiInfo } = {
  getEdgeSdLanViewDataList: {
    method: 'post',
    url: '/edgeSdLanServices/query',
    newApi: true
  },
  getEdgeSdLanList: {
    method: 'get',
    url: '/edgeSdLanServices',
    newApi: true
  },
  getEdgeSdLan: {
    method: 'get',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  addEdgeSdLan: {
    method: 'post',
    url: '/edgeSdLanServices',
    newApi: true
  },
  updateEdgeSdLan: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  updateEdgeSdLanPartial: {
    method: 'PATCH',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  deleteEdgeSdLan: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId',
    newApi: true
  },
  batchDeleteEdgeSdLan: {
    method: 'delete',
    url: '/edgeSdLanServices',
    newApi: true
  }
}