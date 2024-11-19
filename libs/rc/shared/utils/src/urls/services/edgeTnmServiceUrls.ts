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
  getEdgeTnmHostGroupList: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId/hostGroup',
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
  edgeTnmHostGraphsConfig: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId/host/:hostId/graph',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeTnmGraphItems: {
    method: 'get',
    url: '/edgeTnmZabbixServices/:serviceId/graph/:graphId/graphItem',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeTnmGraphItemsInfo: {
    method: 'post',
    url: '/edgeTnmZabbixServices/:serviceId/item',
    newApi: true,
    defaultHeaders: versionHeaders
  },
  getEdgeTnmGraphHistory: {
    method: 'post',
    url: '/edgeTnmZabbixServices/:serviceId/history',
    newApi: true,
    defaultHeaders: versionHeaders
  }
}