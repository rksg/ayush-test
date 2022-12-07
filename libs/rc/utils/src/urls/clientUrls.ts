import { ApiInfo } from '../apiService'

export const ClientUrlsInfo: { [key: string]: ApiInfo } = {
  getClientDetails: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/client/:clientId'
  }
}