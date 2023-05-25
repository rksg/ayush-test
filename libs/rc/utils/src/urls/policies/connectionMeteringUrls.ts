import { ApiInfo } from '../../apiService'

const ConnectionMeteringBaseUrl = ''

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'
type ConnectionMeteringUrlType = 'searchConnectionMeteringList' | 'getConnectionMeteringDetail'
  | 'createConnectionMetering' | 'updateConnectionMetering' | 'deleteConnectionMetering'
  | 'getConnectionMeteringList'

export const ConnectionMeteringUrls: { [key in ConnectionMeteringUrlType]: ApiInfo } = {
  searchConnectionMeteringList: {
    method: 'post',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/query${paginationParams}`
  },
  getConnectionMeteringDetail: {
    method: 'get',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`
  },
  createConnectionMetering: {
    method: 'post',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles`
  },
  updateConnectionMetering: {
    method: 'PATCH',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`
  },
  deleteConnectionMetering: {
    method: 'delete',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`
  },
  getConnectionMeteringList: {
    method: 'get',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles${paginationParams}`
  }
}
