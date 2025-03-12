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
    defaultHeaders: versionHeaders,
    opsApi: 'POST:/edgeMulticastDnsProxyProfiles/query'
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
    defaultHeaders: versionHeaders,
    opsApi: 'POST:/edgeMulticastDnsProxyProfiles'
  },
  updateEdgeMdnsProxy: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders,
    opsApi: 'PUT:/edgeMulticastDnsProxyProfiles/{id}'
  },
  deleteEdgeMdnsProxy: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders,
    opsApi: 'DELETE:/edgeMulticastDnsProxyProfiles/{id}'
  },
  activateEdgeMdnsProxyCluster: {
    method: 'put',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders,
    opsApi: 'PUT:/edgeMulticastDnsProxyProfiles/{id}/venues/{id}/edgeClusters/{id}'
  },
  deactivateEdgeMdnsProxyCluster: {
    method: 'delete',
    url: '/edgeMulticastDnsProxyProfiles/:serviceId/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders,
    opsApi: 'DELETE:/edgeMulticastDnsProxyProfiles/{id}/venues/{id}/edgeClusters/{id}'
  },
  getEdgeMdnsProxyStatsList: {
    method: 'post',
    url: '/edgeMulticastDnsProxyStats/query',
    newApi: true,
    defaultHeaders: versionHeaders
  }
}