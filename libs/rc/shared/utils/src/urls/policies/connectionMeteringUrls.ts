import { ApiInfo } from '@acx-ui/utils'

const ConnectionMeteringBaseUrl = ''

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'
type ConnectionMeteringUrlType = 'searchConnectionMeteringList' | 'getConnectionMeteringDetail'
  | 'createConnectionMetering' | 'updateConnectionMetering' | 'deleteConnectionMetering'
  | 'getConnectionMeteringList' | 'getQosStats'

export const ConnectionMeteringUrls: { [key in ConnectionMeteringUrlType]: ApiInfo } = {
  searchConnectionMeteringList: {
    method: 'post',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/query${paginationParams}`,
    newApi: true
  },
  getConnectionMeteringDetail: {
    method: 'get',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`,
    newApi: true
  },
  createConnectionMetering: {
    method: 'post',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateConnectionMetering: {
    method: 'PATCH',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteConnectionMetering: {
    method: 'delete',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles/:id`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getConnectionMeteringList: {
    method: 'get',
    url: `${ConnectionMeteringBaseUrl}/connectionMeteringProfiles${paginationParams}`,
    newApi: true
  },
  getQosStats: {
    method: 'post',
    url: '/qos/stats/query',
    newApi: true
  }
}
