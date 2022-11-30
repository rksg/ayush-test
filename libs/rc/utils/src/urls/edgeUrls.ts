import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/api/edges'
  },
  getEdge: {
    method: 'get',
    url: '/api/edges/:serialNumber'
  },
  updateEdge: {
    method: 'put',
    url: '/api/edges/:serialNumber'
  }
}
