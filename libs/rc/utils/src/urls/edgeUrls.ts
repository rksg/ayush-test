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
    method: 'post',
    url: '/edges/:serialNumber/ports',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges/:serialNumber/ports',
    newApi: true
  },
  getLatestEdgeFirmware: {
    method: 'get',
    url: '/edges/upgrade/version/latest',
    oldUrl: '/api/edges/upgrade/version/latest',
    newApi: true
  },
  getVenueEdgeFirmwareList: {
    method: 'get',
    url: '/edges/upgrade/venue',
    oldUrl: '/api/edges/upgrade/venue',
    newApi: true
  },
  getAvailableEdgeFirmwareVersions: {
    method: 'get',
    url: '/edges/upgrade/version',
    oldUrl: '/api/edges/upgrade/version',
    newApi: true
  },
  updateEdgeFirmware: {
    method: 'post',
    url: '/edges/upgrade/updateNow',
    oldUrl: '/api/edges/upgrade/updateNow',
    newApi: true
  }
}
