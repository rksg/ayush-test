import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/edges',
    oldUrl: '/api/edges',
    newApi: true
  },
  getEdge: {
    method: 'get',
    url: '/edges/:serialNumber',
    oldUrl: '/api/edges/:serialNumber',
    newApi: true
  },
  updateEdge: {
    method: 'put',
    url: '/edges/:serialNumber',
    oldUrl: '/api/edges/:serialNumber',
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
    url: '/edges/:serialNumber',
    oldUrl: '/api/edges/:serialNumber',
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
    url: '/edges/:serialNumber',
    oldUrl: '/api/edges/:serialNumber',
    newApi: true
  },
  getDnsServers: {
    method: 'get',
    url: '/edges/:serialNumber/dnsServers',
    oldUrl: '/api/edges/:serialNumber/dnsServers',
    newApi: true
  },
  updateDnsServers: {
    method: 'PATCH',
    url: '/edges/:serialNumber/dnsServers',
    oldUrl: '/api/edges/:serialNumber/dnsServers',
    newApi: true
  },
  getPortConfig: {
    method: 'get',
    url: '/edges/:serialNumber/portConfigs',
    oldUrl: '/api/edges/:serialNumber/portConfig',
    newApi: true
  },
  updatePortConfig: {
    method: 'PATCH',
    url: '/edges/:serialNumber/portConfigs',
    oldUrl: '/api/edges/:serialNumber/portConfig',
    newApi: true
  },
  getSubInterfaces: {
    method: 'get',
    url: '/edges/:serialNumber/ports/:mac/subInterfaces',
    oldUrl: '/api/edges/:serialNumber/port/:mac/subInterfaces',
    newApi: true
  },
  addSubInterfaces: {
    method: 'post',
    url: '/edges/:serialNumber/ports/:mac/subInterfaces',
    oldUrl: '/api/edges/:serialNumber/port/:mac/subInterfaces',
    newApi: true
  },
  updateSubInterfaces: {
    method: 'PATCH',
    url: '/edges/:serialNumber/ports/:mac/subInterfaces/:subInterfaceId',
    oldUrl: '/api/edges/:serialNumber/port/:mac/subInterfaces/:subInterfaceId',
    newApi: true
  },
  deleteSubInterfaces: {
    method: 'delete',
    url: '/edges/:serialNumber/ports/:mac/subInterfaces/:subInterfaceId',
    oldUrl: '/api/edges/:serialNumber/port/:mac/subInterfaces/:subInterfaceId',
    newApi: true
  },
  getStaticRoutes: {
    method: 'get',
    url: '/edges/:serialNumber/staticRouteConfigs',
    oldUrl: '/api/edges/:serialNumber/staticRouteConfig',
    newApi: true
  },
  updateStaticRoutes: {
    method: 'PATCH',
    url: '/edges/:serialNumber/staticRouteConfigs',
    oldUrl: '/api/edges/:serialNumber/staticRouteConfig',
    newApi: true
  },
  getEdgePortStatusList: {
    // [New API] no mapping found
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/edges/:serialNumber/ports'
  },
  getLatestEdgeFirmware: {
    method: 'get',
    url: '/api/edges/upgrade/version/latest'
  },
  getVenueEdgeFirmwareList: {
    method: 'get',
    url: '/api/edges/upgrade/venue'
  },
  getAvailableEdgeFirmwareVersions: {
    method: 'get',
    url: '/api/edges/upgrade/version'
  },
  updateEdgeFirmware: {
    method: 'post',
    url: '/api/edges/upgrade/updateNow'
  }
}
