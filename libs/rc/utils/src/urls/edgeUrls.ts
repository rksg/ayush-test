import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  getEdgeList: {
    method: 'post',
    url: '/edges'
  },
  deleteEdge: {
    method: 'delete',
    url: '/api/edges/:serialNumber'
  },
  deleteEdges: {
    method: 'delete',
    url: '/api/edges'
  }
}
