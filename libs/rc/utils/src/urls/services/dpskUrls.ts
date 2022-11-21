import { ApiInfo } from '../../apiService'

export const DpskUrls: { [key: string]: ApiInfo } = {
  getDpsk: {
    method: 'get',
    url: '/api/tenant/:tenantId/dpsk/dpskServiceProfiles/:serviceId'
  },
  addDpsk: {
    method: 'post',
    url: '/api/tenant/:tenantId/dpsk/dpskServiceProfiles'
  },
  updateDpsk: {
    method: 'put',
    url: '/api/tenant/:tenantId/dpsk/dpskServiceProfiles/:serviceId'
  },
  deleteDpsk: {
    method: 'get',
    url: '/api/tenant/:tenantId/dpsk/dpskServiceProfiles/:serviceId'
  },
  deleteDpskList: {
    method: 'delete',
    url: '/api/tenant/:tenantId/dpsk/dpskServiceProfiles'
  }
}
