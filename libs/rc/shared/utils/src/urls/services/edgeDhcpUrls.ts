import { ApiInfo } from '@acx-ui/utils'

export const EdgeDhcpUrls: { [key: string]: ApiInfo } = {
  addDhcpService: {
    method: 'post',
    url: '/edgeDhcpServices',
    oldUrl: '/api/edgeDhcpServices',
    newApi: true
  },
  updateDhcpService: {
    method: 'put',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
    newApi: true
  },
  patchDhcpService: {
    method: 'PATCH',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
    newApi: true
  },
  deleteDhcpService: {
    method: 'delete',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
    newApi: true
  },
  bulkDeleteDhcpServices: {
    method: 'delete',
    url: '/edgeDhcpServices',
    oldUrl: '/api/edgeDhcpServices',
    newApi: true
  },
  getDhcp: {
    method: 'get',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
    newApi: true
  },
  getDhcpList: {
    method: 'get',
    url: '/edgeDhcpServices/dhcps',
    oldUrl: '/api/edgeDhcpServices/dhcps',
    newApi: true
  },
  getDhcpByEdgeId: {
    method: 'get',
    url: '/edgeDhcpServices/edgeDhcpRelationships/:edgeId',
    oldUrl: '/api/edgeDhcpServices/edgeDhcpRelationships/:edgeId',
    newApi: true
  },
  getDhcpPoolStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcpPools/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edgeDhcpServices/dhcpPools',
    newApi: true
  },
  getDhcpStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcps/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edgeDhcpServices/dhcps',
    newApi: true
  },
  getDhcpHostStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcpHosts/query',
    newApi: true
  },
  getDhcpUeSummaryStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcpUeSummary/query',
    newApi: true
  }
}
