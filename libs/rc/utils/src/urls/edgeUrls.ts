import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/api/edges'
  },
  getEdgeList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/edges'
  },
  deleteEdge: {
    method: 'delete',
    url: '/api/edges/:serialNumber'
  },
  deleteEdges: {
    method: 'delete',
    url: '/api/edges'
  },
  sendOtp: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber'
  }
}