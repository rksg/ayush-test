import { ApiInfo } from '@acx-ui/utils'

export const EdgeDhcpUrls: { [key: string]: ApiInfo } = {
  addDhcpService: {
    method: 'post',
    url: '/edgeDhcpServices',
    oldUrl: '/api/edgeDhcpServices',
    newApi: true,
    opsApi: 'POST:/edgeDhcpServices'
  },
  updateDhcpService: {
    method: 'put',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
    newApi: true,
    opsApi: 'PUT:/edgeDhcpServices/{id}'
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
    newApi: true,
    opsApi: 'DELETE:/edgeDhcpServices/{id}'
  },
  getDhcp: {
    method: 'get',
    url: '/edgeDhcpServices/:id',
    oldUrl: '/api/edgeDhcpServices/:id',
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
    url: '/edgeDhcpServices/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edgeDhcpServices/dhcps',
    newApi: true,
    opsApi: 'POST:/edgeDhcpServices/query'
  },
  getDhcpHostStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcpClientLeases/query',
    newApi: true
  },
  getDhcpUeSummaryStats: {
    method: 'post',
    url: '/edgeDhcpServices/dhcpUeSummary/query',
    newApi: true
  },
  restartDhcpService: {
    method: 'PATCH',
    url: '/edgeDhcpServices/:id/venues/:venueId/edgeClusters/:clusterId',
    newApi: true,
    opsApi: 'PATCH:/edgeDhcpServices/{id}/venues/{id}/edgeClusters/{id}'
  },
  activateDhcpService: {
    method: 'put',
    url: '/edgeDhcpServices/:id/venues/:venueId/edgeClusters/:clusterId',
    newApi: true,
    opsApi: 'PUT:/edgeDhcpServices/{id}/venues/{id}/edgeClusters/{id}'
  },
  deactivateDhcpService: {
    method: 'delete',
    url: '/edgeDhcpServices/:id/venues/:venueId/edgeClusters/:clusterId',
    newApi: true,
    opsApi: 'DELETE:/edgeDhcpServices/{id}/venues/{id}/edgeClusters/{id}'
  },
  getDhcpEdgeCompatibilities: {
    method: 'post',
    url: '/edgeDhcpServices/edgeCompatibilities/query',
    newApi: true
  },
  getDhcpEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/edgeDhcpServices/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  }
}
