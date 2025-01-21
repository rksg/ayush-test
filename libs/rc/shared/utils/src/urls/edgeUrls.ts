import { ApiInfo } from '@acx-ui/utils'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges'
  },
  getEdge: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true
  },
  updateEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true
  },
  getEdgeList: {
    method: 'post',
    url: '/edgeProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges',
    newApi: true
  },
  deleteEdge: {
    method: 'delete',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true
  },
  deleteEdges: {
    method: 'delete',
    url: '/edges',
    oldUrl: '/api/edges',
    newApi: true
  },
  sendOtp: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true
  },
  getDnsServers: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/dnsServers',
    newApi: true
  },
  updateDnsServers: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/dnsServers',
    newApi: true
  },
  getPortConfig: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/portConfigs',
    newApi: true
  },
  updatePortConfig: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/portConfigs',
    newApi: true
  },
  getPortConfigDeprecated: {
    method: 'get',
    url: '/edges/:serialNumber/portConfigs',
    oldUrl: '/api/edges/:serialNumber/portConfig',
    newApi: true
  },
  updatePortConfigDeprecated: {
    method: 'PATCH',
    url: '/edges/:serialNumber/portConfigs',
    oldUrl: '/api/edges/:serialNumber/portConfig',
    newApi: true
  },
  getSubInterfaces: {
    method: 'get',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true
  },
  addSubInterfaces: {
    method: 'post',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true
  },
  updateSubInterfaces: {
    method: 'PATCH',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    newApi: true
  },
  deleteSubInterfaces: {
    method: 'delete',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    newApi: true
  },
  importSubInterfacesCSV: {
    method: 'post',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true
  },
  getStaticRoutes: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/staticRouteConfigs',
    newApi: true
  },
  updateStaticRoutes: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/staticRouteConfigs',
    newApi: true
  },
  getEdgePortStatusList: {
    method: 'post',
    url: '/edges/:serialNumber/ports',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges/:serialNumber/ports',
    newApi: true
  },
  getEdgeSubInterfacesStatusList: {
    method: 'post',
    url: '/edges/subInterfaces/query',
    newApi: true
  },
  reboot: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/reboot',
    newApi: true
  },
  shutdown: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/shutdown',
    newApi: true
  },
  factoryReset: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/configReset',
    newApi: true
  },
  pingEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/hostDetails',
    newApi: true
  },
  traceRouteEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/hostDetails',
    newApi: true
  },
  downloadEdgesCSV: {
    method: 'post',
    url: '/edgeProfiles/inventories/query/csvFiles',
    oldUrl: '/edgeProfiles/inventories/query/csvFiles',
    newApi: true
  },
  getEdgeUpDownTime: {
    method: 'post',
    url: '/edges/:serialNumber/uptime',
    oldUrl: '/edges/:serialNumber/uptime',
    newApi: true
  },
  getEdgeTopTraffic: {
    method: 'post',
    url: '/edges/:serialNumber/topTraffic',
    oldUrl: '/edges/:serialNumber/topTraffic',
    newApi: true
  },
  getEdgeResourceUtilization: {
    method: 'post',
    url: '/edges/:serialNumber/resources',
    oldUrl: '/edges/:serialNumber/resources',
    newApi: true
  },
  getEdgePortTraffic: {
    method: 'post',
    url: '/edges/:serialNumber/traffic',
    oldUrl: '/edges/:serialNumber/traffic',
    newApi: true
  },
  getEdgeServiceList: {
    method: 'post',
    url: '/edges/services/query',
    oldUrl: '/edges/services/query',
    newApi: true
  },
  getEdgesTopTraffic: {
    method: 'post',
    url: '/edges/topTraffic',
    oldUrl: '/edges/topTraffic',
    newApi: true
  },
  getEdgesTopResources: {
    method: 'post',
    url: '/edges/topResources',
    oldUrl: '/edges/topResources',
    newApi: true
  },
  deleteService: {
    method: 'delete',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/service',
    newApi: true
  },
  getEdgePasswordDetail: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/passwordDetails',
    newApi: true
  },
  getEdgeLagStatusList: {
    method: 'post',
    url: '/edges/:serialNumber/linkAggregationGroups/query',
    newApi: true
  },
  getEdgeLagList: {
    method: 'get',
    //url: '/edges/:serialNumber/linkAggregationGroups',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags',
    newApi: true
  },
  addEdgeLag: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags',
    newApi: true
  },
  updateEdgeLag: {
    method: 'put',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId',
    newApi: true
  },
  deleteEdgeLag: {
    method: 'delete',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId',
    newApi: true
  },
  getLagSubInterfaces: {
    method: 'get',
    // url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true
  },
  addLagSubInterfaces: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true
  },
  updateLagSubInterfaces: {
    method: 'PATCH',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces/:subInterfaceId',
    newApi: true
  },
  deleteLagSubInterfaces: {
    method: 'delete',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces/:subInterfaceId',
    newApi: true
  },
  importLagSubInterfacesCSV: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true
  },
  getLagSubInterfacesStatus: {
    method: 'post',
    url: '/edges/:serialNumber/linkAggregationGroups/query?isSubInterface=true',
    newApi: true
  },
  getEdgeClusterStatusList: {
    method: 'post',
    url: '/edgeClusterProfiles/query',
    newApi: true
  },
  addEdgeCluster: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters'
  },
  deleteEdgeCluster: {
    method: 'delete',
    url: '/venues/:venueId/edgeClusters/:clusterId',
    newApi: true
  },
  patchEdgeCluster: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId',
    newApi: true
  },
  getEdgeCluster: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId',
    newApi: true
  },
  getEdgeClusterNetworkSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId/networkSettings',
    newApi: true
  },
  patchEdgeClusterNetworkSettings: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId/networkSettings',
    newApi: true
  },
  getEdgeClusterSubInterfaceSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId/subInterfaces',
    newApi: true
  },
  patchEdgeClusterSubInterfaceSettings: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId/subInterfaces',
    newApi: true
  },
  updateEdgeClusterArpTerminationSettings: {
    method: 'put',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/arpTerminationSettings',
    newApi: true
  },
  getEdgeClusterArpTerminationSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/arpTerminationSettings',
    newApi: true
  },
  getEdgeFeatureSets: {
    method: 'post',
    url: '/edgeFeatureSets/query',
    newApi: true
  },
  getSdLanEdgeCompatibilities: {
    method: 'post',
    url: '/edgeSdLanServices/edgeCompatibilities/query',
    newApi: true
  },
  getSdLanApCompatibilities: {
    method: 'post',
    url: '/edgeSdLanServices/apCompatibilities/query',
    newApi: true
  },
  getVenueEdgeCompatibilities: {
    method: 'post',
    url: '/venues/edgeCompatibilities/query',
    newApi: true
  },
  getHqosEdgeCompatibilities: {
    method: 'post',
    url: '/edgeHqosProfiles/edgeCompatibilities/query',
    newApi: true
  },
  getPinEdgeCompatibilities: {
    method: 'post',
    url: '/personalIdentityNetworks/edgeCompatibilities/query',
    newApi: true
  },
  getPinApCompatibilities: {
    method: 'post',
    url: '/personalIdentityNetworks/apCompatibilities/query',
    newApi: true
  },
  getMdnsEdgeCompatibilities: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles/edgeCompatibilities/query',
    newApi: true
  }
}
