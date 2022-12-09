import { ApiInfo } from '../apiService'

export const ClientUrlsInfo: { [key: string]: ApiInfo } = {
  getClientList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/client/clientlist'
  },
  getClientMeta: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/client/meta'
  },
  getClientDetails: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/client/:clientId'
  }
}