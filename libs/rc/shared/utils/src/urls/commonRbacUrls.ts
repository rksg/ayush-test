import { ApiInfo } from '@acx-ui/utils'

import { CommonUrlsInfo } from './commonUrls'

export const CommonRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...CommonUrlsInfo,
  /*
  getVMNetworksList: {
    method: 'post',
    url: '/networks/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/network',
    newApi: true
  },
  */
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
  /*
  getNetworksVenuesList: {
    method: 'post',
    url: '/networks/:networkId/venues',
    oldUrl: '/api/viewmodel/tenant/:tenantId/network/:networkId/venues',
    newApi: true
  },
  getDashboardOverview: {
    method: 'get',
    url: '/dashboards/overviews/',
    oldUrl: '/api/viewmodel/:tenantId/dashboard/overview/',
    newApi: true
  },
  getDashboardV2Overview: {
    method: 'post',
    url: '/dashboards/overviews/query',
    oldUrl: '/api/viewmodel/:tenantId/dashboard/overview/query',
    newApi: true
  },
  getAlarmsList: {
    method: 'post',
    url: '/alarms/query',
    oldUrl: '/api/eventalarmapi/:tenantId/alarm/alarmlist',
    newApi: true
  },
  getAlarmsListMeta: {
    method: 'post',
    url: '/alarms/metas/query',
    oldUrl: '/api/eventalarmapi/:tenantId/alarm/meta',
    newApi: true
  },
  getActivityList: {
    method: 'post',
    url: '/activities/query',
    oldUrl: '/api/tenant/:tenantId/activity/query',
    newApi: true
  },
  getActivityApCompatibilitiesList: {
    method: 'post',
    url: '/apCompatibilities/activities/:activityId/query',
    newApi: true
  },
  getEventList: {
    method: 'post',
    url: '/events/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/eventlist',
    newApi: true
  },
  getEventListMeta: {
    method: 'post',
    url: '/events/metas/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/meta',
    newApi: true
  },
  downloadCSV: {
    method: 'post',
    url: '/events/csvFiles',
    oldUrl: '/api/eventalarmapi/:tenantId/event/export',
    newApi: true
  },
  clearAlarm: {
    method: 'PATCH',
    url: '/alarms/:alarmId',
    oldMethod: 'delete',
    oldUrl: '/api/eventalarmapi/:tenantId/alarm/clear/:alarmId',
    newApi: true
  },*/
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
  /*
  getApGroupsListByGroup: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps/grouped'
  },
  // deprecated:  use getApGroupsList as replacement
  getApGroupListByVenue: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/ap-group',
    newApi: true
  },
  getWifiCallingProfileList: {
    method: 'get',
    url: '/wifiCallingProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wifi-calling-profile',
    newApi: true
  },
  getVenuesList: {
    method: 'post',
    url: '/venues/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue',
    newApi: true
  },
  getVenues: {
    method: 'post',
    url: '/venues/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venues',
    newApi: true
  },
  addVenue: {
    method: 'post',
    url: '/venues',
    oldUrl: '/api/tenant/:tenantId/venue',
    newApi: true
  },
  updateVenue: {
    method: 'put',
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId',
    newApi: true
  },
  */
  getVenue: {
    method: 'get',
    url: '/venues/:venueId',
    newApi: true
  },
  /*
  deleteVenue: {
    method: 'delete',
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId',
    newApi: true
  },
  deleteVenues: {
    method: 'delete',
    url: '/venues',
    oldUrl: '/api/tenant/:tenantId/venue',
    newApi: true
  },
  getVenueDetailsHeader: {
    method: 'get',
    url: '/venues/:venueId/detailHeaders',
    oldUrl: '/api/viewmodel/:tenantId/venue/:venueId/detailheader',
    newApi: true
  },
  getVenueCityList: {
    // [New API] 404 Not Found
    // method: 'post',
    // url: '/venues/citylist/query',
    // oldUrl: '/api/viewmodel/:tenantId/venue/citylist',
    // newApi: true
    method: 'post',
    url: '/api/viewmodel/:tenantId/venue/citylist'
  },
  getVenueSettings: {
    method: 'get',
    url: '/venues/:venueId/wifiSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId',
    newApi: true
  },
  */
  /*
  // move tp WifiConfigUrls.ts
  getVenueMesh: {
    method: 'get',
    url: '/venues/:venueId/apMeshSettings',
    newApi: true
  },
  updateVenueMesh: {
    method: 'put',
    url: '/venues/:venueId/apMeshSettings',
    // url: '/venues/:venueId/meshSettings',
    newApi: true
  },
  getMeshAps: {
    method: 'post',
    url: '/venues/aps/query?mesh=true',
    // url: '/aps/query?mesh=true',
    newApi: true
  },
  */
  downloadApsCSV: {
    method: 'post',
    url: '/venues/aps/query',
    // url: '/aps/query/csvFiles',
    newApi: true
  },
  /*
  getFloorplan: {
    method: 'get',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId',
    newApi: true
  },
  getVenueFloorplans: {
    method: 'get',
    url: '/venues/:venueId/floorplans',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan',
    newApi: true
  },
  addFloorplan: {
    method: 'post',
    url: '/venues/:venueId/floorplans',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan',
    newApi: true
  },
  updateFloorplan: {
    method: 'put',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId',
    newApi: true
  },
  deleteFloorPlan: {
    method: 'delete',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId',
    newApi: true
  },
  getUploadURL: {
    method: 'post',
    url: '/files/uploadurls',
    oldUrl: '/api/file/tenant/:tenantId/upload-url',
    newApi: true
  },
  getVenueSpecificUploadURL: {
    method: 'post',
    url: '/venues/:venueId/signurls/uploadurls',
    newApi: true
  },
  getAllDevices: {
    method: 'post',
    url: '/venues/:venueId/devices',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/devices',
    newApi: true
  },
  */
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
  /*
  // move tp WifiConfigUrls.ts
  getVenueLedOn: {
    method: 'get',
    // url: '/venues/:venueId/ledSettings',
    url: '/venues/:venueId/apModelLedSettings',
    newApi: true
  },
  updateVenueLedOn: {
    method: 'put',
    // url: '/venues/:venueId/ledSettings',
    url: '/venues/:venueId/apModelLedSettings',
    newApi: true
  },
  getVenueApUsbStatus: {
    method: 'get',
    url: '/venues/:venueId/apModelUsbPortSettings',
    newApi: true
  },
  updateVenueApUsbStatus: {
    method: 'put',
    url: '/venues/:venueId/apModelUsbPortSettings',
    newApi: true
  },
  getVenueApModelBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/apModelBandModeSettings',
    newApi: true
  },
  updateVenueApModelBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/apModelBandModeSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    //url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    newApi: true
  },
  updateBssColoring: {
    method: 'put',
    //url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    newApi: true
  },
  getDefaultVenueLanPorts: {
    method: 'get',
    url: '/venues/:venueId/apModelLanPortSettings?defaultOnly=true',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    //url: '/venues/:venueId/lanPortSettings',
    url: '/venues/:venueId/apModelLanPortSettings',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    //url: '/venues/:venueId/lanPortSettings',
    url: '/venues/:venueId/apModelLanPortSettings',
    newApi: true
  },
  */
  /*
  getVenueNetworkList: {
    method: 'post',
    url: '/venues/:venueId/networks/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/networks',
    newApi: true
  },
  venueNetworkApGroup: {
    // [New API] request not support list
    // method: 'post',
    // url: '/networkActivations/query',
    // oldUrl: '/api/tenant/:tenantId/wifi/venue/network-ap-group',
    // newApi: false
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/network-ap-group'
  },
  networkActivations: {
    method: 'post',
    url: '/networkActivations/query',
    newApi: true
  },
  */
  /*
  // move tp WifiConfigUrls.ts
  getDenialOfServiceProtection: {
    method: 'get',
    // url: '/venues/:venueId/dosProtectionSettings',
    url: '/venues/:venueId/apDosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    // url: '/venues/:venueId/dosProtectionSettings',
    url: '/venues/:venueId/apDosProtectionSettings',
    newApi: true
  },
  getVenueRogueAp: {
    method: 'get',
    url: '/venues/:venueId/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueRogueAp: {
    method: 'put',
    url: '/venues/:venueId/roguePolicySettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  */
  /*
  getRogueApLocation: {
    method: 'get',
    url: '/venues/:venueId/rogueLocations?rogueMac=:rogueMac&numLocatingAps=:numLocatingAps',
    // eslint-disable-next-line max-len
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/rogue/location?rogueMac=:rogueMac&numLocatingAps=:numLocatingAps',
    newApi: true
  },
  getOldVenueRogueAp: {
    method: 'post',
    url: '/venues/:venueId/rogueAps/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/rogue/ap',
    newApi: true
  },
  getVenueApEnhancedKey: {
    method: 'get',
    url: '/venues/:venueId/apTlsKeyEnhancedSettings',
    newApi: true
  },
  updateVenueApEnhancedKey: {
    method: 'put',
    url: '/venues/:venueId/apTlsKeyEnhancedSettings',
    newApi: true
  },
  getRoguePolicies: {
    method: 'get',
    url: '/roguePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/rogue-policy',
    newApi: true
  },
  getVenueSwitchSetting: {
    method: 'get',
    url: '/venues/:venueId/switchSettings',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId',
    newApi: true
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/venues/:venueId/switchSettings',
    oldUrl: '/api/switch/tenant/:tenantId/venue',
    newApi: true
  },
  getVenueConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/configHistories/query',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/configurationHistory/query',
    newApi: true
  },
  getVenueConfigHistoryDetail: {
    method: 'post',
    url: '/venues/:venueId/transactions/:transactionId/configHistDetails',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/' +
      'configurationHistory/detail/:transactionId',
    newApi: true
  },
  getApDetailHeader: {
    method: 'get',
    url: '/aps/:serialNumber/headerDetails',
    newApi: true
  },
  getHistoricalClientList: {
    method: 'post',
    url: '/historicalClients/query',
    newApi: true
  },
  */
  getGuestsList: {
    method: 'post',
    url: '/guestUsers/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/guests',
    newApi: true
  },
  addGuestPass: {
    method: 'post',
    url: '/wifiNetworks/:networkId/guestUsers',
    newApi: true
  },
  /*
  getApNetworkList: {
    method: 'post',
    url: '/aps/:serialNumber/networks/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/networks',
    newApi: true
  },
  getApGroupNetworkList: {
    method: 'post',
    url: '/apGroups/:apGroupId/networks/query',
    newApi: true
  },
  */
  getExternalProviders: {
    method: 'get',
    // url: '/networks/wisprProviders',
    url: '/wifiNetworks/wisprProviders',
    newApi: true
  },
  /*
  fetchBotAuth: {
    method: 'post',
    url: '/tenants/chatbot/idtoken',
    oldUrl: '/api/tenant/:tenantId/chatbot/idtoken',
    newApi: true
  },
  getTopology: {
    method: 'get',
    url: '/venues/:venueId/topologies',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/topology',
    newApi: true
  },
  getApMeshTopology: {
    method: 'get',
    url: '/venues/:venueId/meshTopologies',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/topology',
    newApi: true
  },
  */
  /*
  // move tp WifiConfigUrls.ts
  getVenueMdnsFencingPolicy: {
    method: 'get',
    //url: '/venues/:venueId/mDnsFencingSettings',
    url: '/venues/:venueId/apMulticastDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    //url: '/venues/:venueId/mDnsFencingSettings',
    url: '/venues/:venueId/apMulticastDnsFencingSettings',
    newApi: true
  },
  getVenueRadiusOptions: {
    method: 'get',
    //url: '/venues/:venueId/radiusOptions',
    url: '/venues/:venueId/apRadiusOptions',
    newApi: true
  },
  updateVenueRadiusOptions: {
    method: 'put',
    //url: '/venues/:venueId/radiusOptions',
    url: '/venues/:venueId/apRadiusOptions',
    newApi: true
  },
  */
  /*
  addExportSchedules: {
    method: 'post',
    url: '/reports/exportSchedules',
    newApi: true
  },
  updateExportSchedules: {
    method: 'put',
    url: '/reports/exportSchedules',
    newApi: true
  },
  getExportSchedules: {
    method: 'get',
    url: '/reports/exportSchedules',
    newApi: true
  },
  getTimezone: {
    method: 'get',
    url: '/timezones?location=:lat,:lng',
    newApi: true
  }
  */
  clearAlarmByVenue: {
    method: 'delete',
    url: '/venues/:venueId/alarms',
    newApi: true
  },
  deleteGateway: {
    method: 'delete',
    url: '/venues/:venueId/rwgs/:rwgId',
    newApi: true
  },
  addGateway: {
    method: 'post',
    url: '/venues/:venueId/rwgs',
    newApi: true
  },
  updateGateway: {
    method: 'post',
    url: '/venues/:venueId/rwgs',
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
