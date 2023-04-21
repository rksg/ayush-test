import { ApiInfo } from '../../apiService'

export const EdgeFirewallUrls: { [key: string]: ApiInfo } = {
  getEdgeFirewall: {
    method: 'get',
    url: '/edgeFirewallServices/:serviceId',
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
    url: '/edgeFirewallServices/:serviceId',
    newApi: true
  },
  updateEdgeFirewallPartial: {
    method: 'PTACH',
    url: '/edgeFirewallServices/:serviceId',
    newApi: true
  },
  deleteEdgeFirewall: {
    method: 'delete',
    url: '/edgeFirewallServices/:serviceId',
    newApi: true
  },
  deleteEdgeFirewalls: {
    method: 'delete',
    url: '/edgeFirewallServices',
    newApi: true
  }
}
