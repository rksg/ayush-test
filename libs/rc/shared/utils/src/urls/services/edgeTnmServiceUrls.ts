import { ApiInfo } from '@acx-ui/utils'

const versionHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export const EdgeTnmServiceUrls: { [key: string]: ApiInfo } = {
  getEdgeTnmServiceList: {
    method: 'get',
    url: '/edgeTnmZabbixServices',
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
  },
  createEdgeTnmHost: {
    method: 'post',
    url: '/edgeTnmZabbixServices/:serviceId/host',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeTnmHostList: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId/host',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  updateEdgeTnmHost: {
    method: 'put',
    url: '/edgeTnmZabbixServices/:serviceId/host/:hostId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  deleteEdgeTnmHost: {
    method: 'delete',
    url: '/edgeTnmZabbixServices/:serviceId/host/:hostId',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  edgeTnmHostStats: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId/host/:hostId/graph',
    newApi: true,
    defaultHeaders: versionHeaders
  }
}