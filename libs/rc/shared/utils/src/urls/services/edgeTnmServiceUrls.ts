import { ApiInfo } from '@acx-ui/utils'

const versionHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const EdgeTnmServiceUrls: { [key: string]: ApiInfo } = {
  getEdgeTnmService: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  addEdgeTnmService: {
    method: 'post',
    url: '/edgeTnmZabbixServices',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  deleteEdgeTnmService: {
    method: 'delete',
    url: '/edgeTnmZabbixServices/:serviceId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  activateEdgeTnmServiceAppCluster: {
    method: 'put',
    url: '/edgeTnmZabbixServices/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  deactivateEdgeTnmServiceAppCluster: {
    method: 'delete',
    url: '/edgeTnmZabbixServices/venues/:venueId/edgeClusters/:edgeClusterId',
    newApi: true,
    defaultHeaders: versionHeaders
  }
}