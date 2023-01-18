import { ApiInfo } from '../../apiService'

export const EdgeDhcpUrls: { [key: string]: ApiInfo } = {
  addDhcpService: {
    method: 'post',
    url: '/api/edgeDhcpServices'
  },
  updateDhcpService: {
    method: 'put',
    url: '/api/edgeDhcpServices/:id'
  },
  deleteDhcpService: {
    method: 'delete',
    url: '/api/edgeDhcpServices/:id'
  },
  bulkdeleteDhcpServices: {
    method: 'delete',
    url: '/api/edgeDhcpServices'
  },
  getDhcp: {
    method: 'get',
    url: '/api/edgeDhcpServices/:id'
  },
  getDhcpList: {
    method: 'get',
    url: '/api/edgeDhcpServices/dhcps'
  }
}
