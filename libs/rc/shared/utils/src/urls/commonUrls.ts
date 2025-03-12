import { ApiInfo } from '@acx-ui/utils'

export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/networks/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/network',
    newApi: true
  },
  getWifiNetworksList: {
    method: 'post',
    url: '/wifiNetworks/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getNetworksDetailHeader: {
    // [New API] Path variable not match
    // method: 'get',
    // url: '/networks/:networkId/headerDetails',
    // oldUrl: '/api/viewmodel/:tenantId/network/:networkId/detailheader',
    // newApi: true
    method: 'get',
    url: '/api/viewmodel/:tenantId/network/:networkId/detailheader'
  },
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
  getAlarmSummaries: {
    method: 'post',
    url: '/dashboards/alarmSummaries/query',
    newApi: true
  },
  getVenueSummaries: {
    method: 'post',
    url: '/dashboards/venueSummaries/query',
    newApi: true
  },
  getDeviceSummaries: {
    method: 'post',
    url: '/dashboards/deviceSummaries/query',
    newApi: true
  },
  getClientSummaries: {
    method: 'post',
    url: '/dashboards/clientSummaries/query',
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
    opsApi: 'POST:/events/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/eventlist',
    newApi: true
  },
  getEventListMeta: {
    method: 'post',
    url: '/events/metas/query',
    opsApi: 'POST:/events/metas/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/meta',
    newApi: true
  },
  getEventListDetails: {
    method: 'post',
    url: '/events/details/query',
    opsApi: 'POST:/events/details/query',
    oldUrl: '/events/metas/query',
    newApi: true
  },
  downloadCSV: {
    method: 'post',
    url: '/events/csvFiles',
    opsApi: 'POST:/events/csvFiles',
    oldUrl: '/api/eventalarmapi/:tenantId/event/export',
    newApi: true
  },
  clearAlarm: {
    method: 'PATCH',
    url: '/alarms/:alarmId',
    opsApi: 'PATCH:/alarms/{id}',
    oldMethod: 'delete',
    oldUrl: '/api/eventalarmapi/:tenantId/alarm/clear/:alarmId',
    newApi: true
  },
  getApsList: {
    method: 'post',
    url: '/aps/query',
    oldUrl: '/api/viewmodel/:tenantId/aps',
    newApi: true
  },
  getApGroupsListByGroup: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps/grouped'
  },
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
    opsApi: 'POST:/venues',
    newApi: true
  },
  updateVenue: {
    method: 'put',
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId',
    opsApi: 'PUT:/venues/{id}',
    newApi: true
  },
  getVenue: {
    method: 'get',
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId',
    newApi: true
  },
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
    opsApi: 'DELETE:/venues',
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
  updateVenueMesh: {
    method: 'put',
    url: '/venues/:venueId/meshSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/mesh',
    newApi: true
  },
  getMeshAps: {
    method: 'post',
    url: '/aps/query?mesh=true',
    oldUrl: '/api/viewmodel/:tenantId/aps/mesh',
    newApi: true
  },
  downloadApsCSV: {
    method: 'post',
    url: '/aps/query/csvFiles',
    oldUrl: '/aps/query/csvFiles',
    newApi: true
  },
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
    opsApi: 'POST:/venues/{id}/floorplans',
    newApi: true
  },
  updateFloorplan: {
    method: 'put',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId',
    opsApi: 'PUT:/venues/{id}/floorplans/{id}',
    newApi: true
  },
  deleteFloorPlan: {
    method: 'delete',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId',
    opsApi: 'DELETE:/venues/{id}/floorplans/{id}',
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
  UpdateSwitchPosition: {
    method: 'put',
    url: '/switches/:serialNumber/position',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:serialNumber/position',
    newApi: true
  },
  UpdateApPosition: {
    method: 'put',
    url: '/venues/aps/:serialNumber/floorPositions',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/position',
    newApi: true
  },
  getVenueApModels: {
    method: 'get',
    url: '/venues/:venueId/apModels',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue/:venueId/ap-models',
    newApi: true
  },
  getVenueLedOn: {
    method: 'get',
    url: '/venues/:venueId/ledSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/led',
    newApi: true
  },
  updateVenueLedOn: {
    method: 'put',
    url: '/venues/:venueId/ledSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/led',
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
    url: '/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  updateBssColoring: {
    method: 'put',
    url: '/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/venues/:venueId/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/lan-port',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/venues/:venueId/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/lan-port',
    newApi: true
  },
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
  getDenialOfServiceProtection: {
    method: 'get',
    url: '/venues/:venueId/dosProtectionSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dos-protection',
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/venues/:venueId/dosProtectionSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dos-protection',
    newApi: true
  },
  getVenueRogueAp: {
    method: 'get',
    url: '/venues/:venueId/rogueApSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/rogue/ap',
    newApi: true
  },
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
  updateVenueRogueAp: {
    method: 'put',
    url: '/venues/:venueId/rogueApSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/rogue/ap',
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
    opsApi: 'PUT:/venues/{id}/switchSettings',
    newApi: true
  },
  getVenueConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/configHistories/query',
    newApi: true
  },
  getVenueConfigHistoryDetail: {
    method: 'post',
    url: '/venues/:venueId/transactions/:transactionId/configHistDetails',
    newApi: true
  },
  getApDetailHeader: {
    method: 'get',
    url: '/aps/:serialNumber/headerDetails',
    oldUrl: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/detailheader',
    newApi: true
  },
  getHistoricalClientList: {
    method: 'post',
    url: '/historicalClients/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/hist_client_list',
    newApi: true
  },
  getGuestsList: {
    method: 'post',
    url: '/guestUsers/query',
    newApi: true
  },
  addGuestPass: {
    method: 'post',
    url: '/wifiNetworks/:networkId/guestUsers',
    newApi: true
  },
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
  getExternalProviders: {
    method: 'get',
    url: '/networks/wisprProviders',
    oldUrl: '/api/tenant/:tenantId/wifi/network/external-providers',
    newApi: true
  },
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
  getVenueMdnsFencingPolicy: {
    method: 'get',
    url: '/venues/:venueId/mDnsFencingSettings',
    oldUrl: '/api/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    url: '/venues/:venueId/mDnsFencingSettings',
    oldUrl: '/api/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  getVenueRadiusOptions: {
    method: 'get',
    url: '/venues/:venueId/radiusOptions',
    newApi: true
  },
  updateVenueRadiusOptions: {
    method: 'put',
    url: '/venues/:venueId/radiusOptions',
    newApi: true
  },
  addExportSchedules: {
    method: 'post',
    url: '/reports/exportSchedules',
    opsApi: 'POST:/reports/exportSchedules',
    newApi: true
  },
  updateExportSchedules: {
    method: 'put',
    url: '/reports/exportSchedules',
    opsApi: 'PUT:/reports/exportSchedules',
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
}
