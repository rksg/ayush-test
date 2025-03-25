import { ApiInfo } from '@acx-ui/utils'

import { CommonUrlsInfo } from './commonUrls'

export const CommonRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...CommonUrlsInfo,
  getWifiNetworksList: {
    method: 'post',
    url: '/wifiNetworks/query',
    newApi: true
  },
  getNetworksDetailHeader: {
    method: 'get',
    url: '/networks/:networkId/headerDetails',
    // oldUrl: '/api/viewmodel/:tenantId/network/:networkId/detailheader',
    newApi: true
  },
  getApsList: {
    method: 'post',
    // url: '/aps/query',
    url: '/venues/aps/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenue: {
    method: 'get',
    url: '/venues/:venueId',
    newApi: true
  },
  downloadApsCSV: {
    method: 'post',
    url: '/venues/aps/query',
    // url: '/aps/query/csvFiles',
    newApi: true
  },
  UpdateSwitchPosition: {
    method: 'put',
    //url: '/switches/:serialNumber/position',
    url: '/venues/:venueId/switches/:serialNumber/positions',
    opsApi: 'PUT:/venues/{id}/switches/{id}/positions',
    newApi: true
  },
  getVenueCityList: {
    method: 'post',
    url: '/venues/citylist/query',
    newApi: true
  },
  GetApPosition: {
    method: 'get',
    url: '/venues/:venueId/floorplans/:floorplanId/aps/:serialNumber/floorPositions',
    newApi: true
  },
  UpdateApPosition: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/floorPositions',
    url: '/venues/:venueId/floorplans/:floorplanId/aps/:serialNumber/floorPositions',
    opsApi: 'PUT:/venues/{id}/floorplans/{id}/aps/{id}/floorPositions',
    newApi: true
  },
  RemoveApPosition: {
    method: 'delete',
    // url: '/venues/aps/:serialNumber/floorPositions',
    url: '/venues/:venueId/floorplans/:floorplanId/aps/:serialNumber/floorPositions',
    opsApi: 'DELETE:/venues/{id}/floorplans/{id}/aps/{id}/floorPositions',
    newApi: true
  },
  getVenueApModels: {
    method: 'get',
    url: '/venues/:venueId/aps/models',
    newApi: true
  },
  getGuestsList: {
    method: 'post',
    url: '/guestUsers/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/guests',
    newApi: true
  },
  addGuestPass: {
    method: 'post',
    url: '/wifiNetworks/:networkId/guestUsers',
    opsApi: 'POST:/wifiNetworks/{id}/guestUsers',
    newApi: true
  },
  getExternalProviders: {
    method: 'get',
    // url: '/networks/wisprProviders',
    url: '/wifiNetworks/wisprProviders',
    newApi: true
  },
  clearAlarmByVenue: {
    method: 'delete',
    url: '/venues/:venueId/alarms',
    opsApi: 'DELETE:/venues/{id}/alarms',
    newApi: true
  },
  clearAllAlarms: {
    method: 'delete',
    url: '/venues/alarms',
    opsApi: 'DELETE:/venues/alarms',
    newApi: true
  },
  deleteGateway: {
    method: 'delete',
    url: '/venues/:venueId/rwgs/:rwgId',
    opsApi: 'DELETE:/venues/{id}/rwgs/{id}',
    newApi: true
  },
  addGateway: {
    method: 'post',
    url: '/venues/:venueId/rwgs',
    opsApi: 'POST:/venues/{id}/rwgs',
    newApi: true
  },
  updateGateway: {
    method: 'post',
    url: '/venues/:venueId/rwgs',
    opsApi: 'POST:/venues/{id}/rwgs',
    newApi: true
  },
  getRwgList: {
    method: 'post',
    url: '/rwgs/query',
    newApi: true
  },
  getRwgListByVenueId: {
    method: 'post',
    url: '/venues/:venueId/rwgs/query',
    newApi: true
  },
  getGatewayDashboard: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/dashboards',
    newApi: true
  },
  getClusterGatewayDashboard: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/dashboards/nodes/:clusterNodeId',
    newApi: true
  },
  getGatewayAlarms: {
    method: 'post',
    url: '/venues/:venueId/rwgs/:gatewayId/alarms/query',
    newApi: true
  },
  getGatewayFileSystems: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/filesystems',
    newApi: true
  },
  getClusterGatewayFileSystems: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/filesystems/nodes/:clusterNodeId',
    newApi: true
  },
  getGatewayTopProcess: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/topprocess',
    newApi: true
  },
  getClusterGatewayTopProcess: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/topprocess/nodes/:clusterNodeId',
    newApi: true
  },
  getGateway: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId',
    newApi: true
  },
  getGatewayDetails: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/details',
    newApi: true
  },
  getClusterGatewayDetails: {
    method: 'get',
    url: '/venues/:venueId/rwgs/:gatewayId/details/nodes/:clusterNodeId',
    newApi: true
  },
  UpdateRwgPosition: {
    method: 'put',
    url: '/venues/:venueId/rwgs/:gatewayId/floorPositions',
    opsApi: 'PUT:/venues/{id}/rwgs/{id}/floorPositions',
    newApi: true
  },

  updateVenueLanPortSpecificSettings: {
    method: 'put',
    url: '/venues/:venueId/apModels/:apModel/lanPortSpecificSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
