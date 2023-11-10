import { ApiInfo } from '@acx-ui/utils'

export const EdgeCentralizedForwardingUrls: { [key: string]: ApiInfo } = {
  getEdgeCentralizedForwardingViewDataList: {
    method: 'post',
    url: '/edgeCentralizedForwardingServices/query',
    newApi: true
  },
  getEdgeCentralizedForwardingList: {
    method: 'get',
    url: '/edgeCentralizedForwardingServices',
    newApi: true
  },
  getEdgeCentralizedForwarding: {
    method: 'get',
    url: '/edgeCentralizedForwardingServices/:serviceId',
    newApi: true
  },
  addEdgeCentralizedForwarding: {
    method: 'post',
    url: '/edgeCentralizedForwardingServices',
    newApi: true
  },
  updateEdgeCentralizedForwarding: {
    method: 'put',
    url: '/edgeCentralizedForwardingServices/:serviceId',
    newApi: true
  },
  updateEdgeCentralizedForwardingPartial: {
    method: 'PATCH',
    url: '/edgeCentralizedForwardingServices/:serviceId',
    newApi: true
  },
  deleteEdgeCentralizedForwarding: {
    method: 'delete',
    url: '/edgeCentralizedForwardingServices/:serviceId',
    newApi: true
  },
  batchDeleteEdgeCentralizedForwarding: {
    method: 'delete',
    url: '/edgeCentralizedForwardingServices',
    newApi: true
  }
}