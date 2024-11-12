import { ApiInfo } from '@acx-ui/utils'

const versionHeaders = {
  'Accept': 'application/vnd.ruckus.v1+json',
  'Content-Type': 'application/vnd.ruckus.v1+json'
}

export const EdgeMdnsProxyUrls: { [key: string]: ApiInfo } = {
  getEdgeMdnsProxyViewDataList: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles/query',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeMdnsProxy: {
    method: 'get',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  addEdgeMdnsProxy: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  updateEdgeMdnsProxy: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  deleteEdgeMdnsProxy: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  activateEdgeMdnsProxyCluster: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  deactivateEdgeMdnsProxyCluster: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeMdnsProxyStatsList: {
    method: 'post',
    url: '/edgeMulticastDnsProxyStats/query',
    newApi: true,
    defaultHeaders: versionHeaders
  }
}