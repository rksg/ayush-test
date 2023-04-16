import { ApiInfo } from '../../apiService'

export const EdgeFirewallUrls: { [key: string]: ApiInfo } = {
  getEdgeFirewallViewDataList: {
    method: 'post',
    url: '/edgeFirewallServices/query',
    newApi: true
  },
  deleteEdgeFirewall: {
    method: 'delete',
    url: '/edgeFirewallServices/:firewallId',
    newApi: true
  },
  batchDeleteEdgeFirewall: {
    method: 'delete',
    url: '/edgeFirewallServices',
    newApi: true
  }
}