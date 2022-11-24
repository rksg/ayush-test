import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/api/edges'
  }
}
