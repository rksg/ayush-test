import { ApiInfo } from '@acx-ui/utils'

const versionHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const EdgeTnmServiceUrls: { [key: string]: ApiInfo } = {
  getEdgeTnmServiceList: {
    method: 'get',
    url: '/edgeTnmZabbixServices/',
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