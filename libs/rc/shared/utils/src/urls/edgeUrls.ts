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
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}'
  },
  updateEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}'
  },
  getEdgeList: {
    method: 'post',
    url: '/edgeProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges',
    newApi: true,
    opsApi: 'POST:/edgeProfiles/query'
  },
  deleteEdge: {
    method: 'delete',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true,
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}'
  },
  sendOtp: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}'
  },
  getDnsServers: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/dnsServers',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/dnsServers'
  },
  updateDnsServers: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/dnsServers',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/dnsServers'
  },
  getPortConfig: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/portConfigs',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/portConfigs'
  },
  updatePortConfig: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/portConfigs',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/portConfigs'
  },
  getSubInterfaces: {
    method: 'get',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/ports/{id}/subInterfaces'
  },
  addSubInterfaces: {
    method: 'post',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/ports/{id}/subInterfaces'
  },
  updateSubInterfaces: {
    method: 'PATCH',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    newApi: true,
    // eslint-disable-next-line max-len
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/ports/{id}/subInterfaces/{id}'
  },
  deleteSubInterfaces: {
    method: 'delete',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces/:subInterfaceId',
    newApi: true,
    // eslint-disable-next-line max-len
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/ports/{id}/subInterfaces/{id}'
  },
  importSubInterfacesCSV: {
    method: 'post',
    // url: '/edges/:serialNumber/ports/:portId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/ports/:portId/subInterfaces',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/ports/{id}/subInterfaces'
  },
  getStaticRoutes: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/staticRouteConfigs',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/staticRouteConfigs'
  },
  updateStaticRoutes: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/staticRouteConfigs',
    newApi: true,
    // eslint-disable-next-line max-len
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/staticRouteConfigs'
  },
  getEdgePortStatusList: {
    method: 'post',
    url: '/edges/:serialNumber/ports',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges/:serialNumber/ports',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/ports'
  },
  getEdgeGeneralPortStatusList: {
    method: 'post',
    url: '/edges/ports/query',
    newApi: true,
    opsApi: 'POST:/edges/ports/query'
  },
  getEdgeSubInterfacesStatusList: {
    method: 'post',
    url: '/edges/subInterfaces/query',
    newApi: true,
    opsApi: 'POST:/edges/subInterfaces/query'
  },
  reboot: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/reboot',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/reboot'
  },
  shutdown: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/shutdown',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/shutdown'
  },
  factoryReset: {
    method: 'post',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/configReset',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/configReset'
  },
  pingEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/hostDetails',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/hostDetails'
  },
  traceRouteEdge: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/hostDetails',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/hostDetails'
  },
  getEdgeUpDownTime: {
    method: 'post',
    url: '/edges/:serialNumber/uptime',
    oldUrl: '/edges/:serialNumber/uptime',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/uptime'
  },
  getEdgeTopTraffic: {
    method: 'post',
    url: '/edges/:serialNumber/topTraffic',
    oldUrl: '/edges/:serialNumber/topTraffic',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/topTraffic'
  },
  getEdgeResourceUtilization: {
    method: 'post',
    url: '/edges/:serialNumber/resources',
    oldUrl: '/edges/:serialNumber/resources',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/resources'
  },
  getEdgePortTraffic: {
    method: 'post',
    url: '/edges/:serialNumber/traffic',
    oldUrl: '/edges/:serialNumber/traffic',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/traffic'
  },
  getEdgeServiceList: {
    method: 'post',
    url: '/edges/services/query',
    oldUrl: '/edges/services/query',
    newApi: true,
    opsApi: 'POST:/edges/services/query'
  },
  getEdgeClusterServiceList: {
    method: 'post',
    url: '/edgeClusterServices/query',
    newApi: true,
    opsApi: 'POST:/edgeClusterServices/query'
  },
  getEdgesTopTraffic: {
    method: 'post',
    url: '/edges/topTraffic',
    oldUrl: '/edges/topTraffic',
    newApi: true,
    opsApi: 'POST:/edges/topTraffic'
  },
  getEdgesTopResources: {
    method: 'post',
    url: '/edges/topResources',
    oldUrl: '/edges/topResources',
    newApi: true,
    opsApi: 'POST:/edges/topResources'
  },
  deleteService: {
    method: 'delete',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/service',
    newApi: true,
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}/service'
  },
  getEdgePasswordDetail: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/passwordDetails',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/passwordDetails'
  },
  getEdgeLagStatusList: {
    method: 'post',
    url: '/edges/:serialNumber/linkAggregationGroups/query',
    newApi: true,
    opsApi: 'POST:/edges/{serialNumber}/linkAggregationGroups/query'
  },
  getEdgeGeneralLagStatusList: {
    method: 'post',
    url: '/edges/linkAggregationGroups/query',
    newApi: true,
    opsApi: 'POST:/edges/linkAggregationGroups/query'
  },
  getEdgeLagList: {
    method: 'get',
    //url: '/edges/:serialNumber/linkAggregationGroups',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags'
  },
  addEdgeLag: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags'
  },
  updateEdgeLag: {
    method: 'put',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId',
    newApi: true,
    opsApi: 'PUT:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}'
  },
  deleteEdgeLag: {
    method: 'delete',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId',
    newApi: true,
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}'
  },
  getLagSubInterfaces: {
    method: 'get',
    // url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}/subInterfaces'
  },
  addLagSubInterfaces: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}/subInterfaces'
  },
  updateLagSubInterfaces: {
    method: 'PATCH',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces/:subInterfaceId',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}/subInterfaces/{id}'
  },
  deleteLagSubInterfaces: {
    method: 'delete',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces/:subInterfaceId',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces/:subInterfaceId',
    newApi: true,
    // eslint-disable-next-line max-len
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}/subInterfaces/{id}'
  },
  importLagSubInterfacesCSV: {
    method: 'post',
    //url: '/edges/:serialNumber/linkAggregationGroups/:lagId/subInterfaces',
    // eslint-disable-next-line max-len
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/edges/:serialNumber/lags/:lagId/subInterfaces',
    newApi: true,
    opsApi: 'POST:/venues/{id}/edgeClusters/{id}/edges/{serialNumber}/lags/{id}/subInterfaces'
  },
  getLagSubInterfacesStatus: {
    method: 'post',
    url: '/edges/:serialNumber/linkAggregationGroups/query?isSubInterface=true',
    newApi: true
  },
  getEdgeClusterStatusList: {
    method: 'post',
    url: '/edgeClusterProfiles/query',
    newApi: true,
    opsApi: 'POST:/edgeClusterProfiles/query'
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
    newApi: true,
    opsApi: 'DELETE:/venues/{id}/edgeClusters/{id}'
  },
  patchEdgeCluster: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}'
  },
  getEdgeCluster: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}'
  },
  getEdgeClusterNetworkSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId/networkSettings',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/networkSettings'
  },
  patchEdgeClusterNetworkSettings: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId/networkSettings',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/networkSettings'
  },
  getEdgeClusterSubInterfaceSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:clusterId/subInterfaces',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/subInterfaces'
  },
  patchEdgeClusterSubInterfaceSettings: {
    method: 'PATCH',
    url: '/venues/:venueId/edgeClusters/:clusterId/subInterfaces',
    newApi: true,
    opsApi: 'PATCH:/venues/{id}/edgeClusters/{id}/subInterfaces'
  },
  updateEdgeClusterArpTerminationSettings: {
    method: 'put',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/arpTerminationSettings',
    newApi: true,
    opsApi: 'PUT:/venues/{id}/edgeClusters/{id}/arpTerminationSettings'
  },
  getEdgeClusterArpTerminationSettings: {
    method: 'get',
    url: '/venues/:venueId/edgeClusters/:edgeClusterId/arpTerminationSettings',
    newApi: true,
    opsApi: 'GET:/venues/{id}/edgeClusters/{id}/arpTerminationSettings'
  },
  getEdgeFeatureSets: {
    method: 'post',
    url: '/edgeFeatureSets/query',
    newApi: true
  },
  getEdgeFeatureSetsV1_1: {
    method: 'post',
    url: '/edgeFeatureSets/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getSdLanEdgeCompatibilities: {
    method: 'post',
    url: '/edgeSdLanServices/edgeCompatibilities/query',
    newApi: true
  },
  getSdLanEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/edgeSdLanServices/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  getVenueEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/venues/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getHqosEdgeCompatibilities: {
    method: 'post',
    url: '/edgeHqosProfiles/edgeCompatibilities/query',
    newApi: true
  },
  getHqosEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/edgeHqosProfiles/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getPinEdgeCompatibilities: {
    method: 'post',
    url: '/personalIdentityNetworks/edgeCompatibilities/query',
    newApi: true
  },
  getPinEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/personalIdentityNetworks/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
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
  },
  getMdnsEdgeCompatibilitiesV1_1: {
    method: 'post',
    url: '/edgeMulticastDnsProxyProfiles/edgeCompatibilities/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  // legacy and deprecated
  deleteEdges: {
    method: 'delete',
    url: '/edges',
    oldUrl: '/api/edges',
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
  // cannot find in whole rkscloud project
  downloadEdgesCSV: {
    method: 'post',
    url: '/edgeProfiles/inventories/query/csvFiles',
    oldUrl: '/edgeProfiles/inventories/query/csvFiles',
    newApi: true
  }
}
