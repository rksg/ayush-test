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
  patchDhcpService: {
    method: 'PATCH',
    url: '/api/edgeDhcpServices/:id'
  },
  deleteDhcpService: {
    method: 'delete',
    url: '/api/edgeDhcpServices/:id'
  },
  bulkDeleteDhcpServices: {
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
  },
  getDhcpByEdgeId: {
    method: 'get',
    url: '/api/edgeDhcpServices/edgeDhcpRelationship/:edgeId'
  },
  getDhcpPoolStats: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/edgeDhcpServices/dhcpPools'
  },
  getDhcpStats: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/edgeDhcpServices/dhcps'
  }
}
