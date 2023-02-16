import { ApiInfo } from '../apiService'

export const EdgeUrlsInfo: { [key: string]: ApiInfo } = {
  addEdge: {
    method: 'post',
    url: '/api/edges'
  },
  getEdge: {
    method: 'get',
    url: '/api/edges/:serialNumber'
  },
  updateEdge: {
    method: 'put',
    url: '/api/edges/:serialNumber'
  },
  getEdgeList: {
    method: 'post',
    url: '/edgeProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/edges',
    newApi: true
  },
  deleteEdge: {
    method: 'delete',
    url: '/api/edges/:serialNumber'
  },
  deleteEdges: {
    method: 'delete',
    url: '/api/edges'
  },
  sendOtp: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber'
  },
  getDnsServers: {
    method: 'get',
    url: '/api/edges/:serialNumber/dnsServers'
  },
  updateDnsServers: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber/dnsServers'
  },
  getPortConfig: {
    method: 'get',
    url: '/api/edges/:serialNumber/portConfig'
  },
  updatePortConfig: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber/portConfig'
  },
  getSubInterfaces: {
    method: 'get',
    url: '/api/edges/:serialNumber/port/:mac/subInterfaces'
  },
  addSubInterfaces: {
    method: 'post',
    url: '/api/edges/:serialNumber/port/:mac/subInterfaces'
  },
  updateSubInterfaces: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber/port/:mac/subInterfaces/:subInterfaceId'
  },
  deleteSubInterfaces: {
    method: 'delete',
    url: '/api/edges/:serialNumber/port/:mac/subInterfaces/:subInterfaceId'
  },
  getStaticRoutes: {
    method: 'get',
    url: '/api/edges/:serialNumber/staticRouteConfig'
  },
  updateStaticRoutes: {
    method: 'PATCH',
    url: '/api/edges/:serialNumber/staticRouteConfig'
  },
  getEdgePortStatusList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/edges/:serialNumber/ports'
  }
}
