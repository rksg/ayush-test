import { ApiInfo } from '../../apiService'

export const ClientIsolationUrls: { [key: string]: ApiInfo } = {
  addClientIsolation: {
    method: 'post',
    url: '/isolationAllowlists',
    newApi: true
  },
  getClientIsolation: {
    method: 'get',
    url: '/isolationAllowlists/:policyId',
    newApi: true
  },
  updateClientIsolation: {
    method: 'put',
    url: '/isolationAllowlists/:policyId',
    newApi: true
  },
  deleteClientIsolation: {
    method: 'delete',
    url: '/isolationAllowlists/:policyId',
    newApi: true
  },
  getClientIsolationList: {
    method: 'get',
    url: '/isolationAllowlists',
    newApi: true
  }
}
