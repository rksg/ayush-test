import { ApiInfo } from '@acx-ui/utils'

export const EdgeMdnsProxyUrls: { [key: string]: ApiInfo } = {
  getEdgeMdnsProxyViewDataList: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles/query',
    newApi: true
  },
  getEdgeMdnsProxy: {
    method: 'get',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true
  },
  addEdgeMdnsProxy: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles',
    newApi: true
  },
  updateEdgeMdnsProxy: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true
  },
  deleteEdgeMdnsProxy: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true
  },
  activateEdgeMdnsProxyCluster: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  },
  deactivateEdgeMdnsProxyCluster: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true
  }
}