import { ApiInfo } from '../../apiService'

export const EdgeFirewallUrls: { [key: string]: ApiInfo } = {
  getEdgeFirewall: {
    method: 'get',
    url: '/edgeFirewallServices/:firewallId',
    newApi: true
  },
  getEdgeFirewallList: {
    method: 'get',
    url: '/edgeFirewallServices',
    newApi: true
  },
  addEdgeFirewall: {
    method: 'post',
    url: '/edgeFirewallServices',
    newApi: true
  },
  updateEdgeFirewall: {
    method: 'put',
    url: '/wifiCallingServiceProfiles/:firewallId',
    newApi: true
  },
  updateEdgeFirewallPartial: {
    method: 'PTACH',
    url: '/edgeFirewallServices/:firewallId',
    newApi: true
  },
  deleteEdgeFirewall: {
    method: 'delete',
    url: '/edgeFirewallServices/:firewallId',
    newApi: true
  },
  deleteEdgeFirewalls: {
    method: 'delete',
    url: '/edgeFirewallServices',
    newApi: true
  }
}
