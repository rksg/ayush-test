import { ApiInfo } from '../apiService'

export const websocketServerUrl = '/api/websocket/socket.io'

export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/networks/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/network',
    newApi: true
  },
  getNetworksDetailHeader: {
    method: 'get',
    // new api not found
    // url: '/networks/:networkId/headerDetails',
    // newApi: true,
    url: '/api/viewmodel/:tenantId/network/:networkId/detailheader'
  },
  getNetworksVenuesList: {
    method: 'post',
    // url: '/networks/:networkId/venues',
    // newApi: true,
    url: '/api/viewmodel/tenant/:tenantId/network/:networkId/venues'
  },
  getCloudpathList: {
    method: 'get',
    url: '/cloudpaths',
    oldUrl: '/api/tenant/:tenantId/wifi/cloudpath',
    newApi: true
  },
  getDashboardOverview: {
    method: 'get',
    url: '/dashboards/overviews/',
    oldUrl: '/api/viewmodel/:tenantId/dashboard/overview/',
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
  clearAlarm: {
    method: 'delete',
    url: '/api/eventalarmapi/:tenantId/alarm/clear/:alarmId'
  },
  clearAllAlarm: {
    method: 'delete',
    url: '/alarms',
    oldUrl: '/api/eventalarmapi/:tenantId/alarm',
    newApi: true
  },
  getApsList: {
    method: 'post',
    url: '/aps/query',
    oldUrl: '/api/viewmodel/:tenantId/aps',
    newApi: true
  },
  getApGroupList: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/ap-group',
    newApi: true
  },
  getAllUserSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin-settings/ui'
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/l2AclPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/l2-acl-policy/query',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/l3AclPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/l3-acl-policy/query',
    newApi: true
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/devicePolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/device-policy/query',
    newApi: true
  },
  getApplicationPolicyList: {
    method: 'post',
    url: '/applicationPolicies/query',
    oldUrl: '/api/tenant/:tenantId/wifi/application-policy/query',
    newApi: true
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/accessControlProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/access-control-profile',
    newApi: true
  },
  getWifiCallingProfileList: {
    method: 'get',
    url: '/wifiCallingProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/wifi-calling-profile',
    newApi: true
  },
  getVlanPoolList: {
    method: 'get',
    url: '/vlanPools',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool',
    newApi: true
  },
  getServicesList: {
    method: 'post',
    url: '/serviceProfiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/serviceProfiles',
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
    url: '/api/viewmodel/tenant/:tenantId/venues'
  },
  addVenue: {
    method: 'post',
    // newApi: true,
    // url: '/venues',
    url: '/api/tenant/:tenantId/venue'
  },
  updateVenue: {
    method: 'put',
    // newApi: true,
    // url: '/venues/:venueId',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  getVenue: {
    method: 'get',
    // newApi: true,
    // url: '/venues/:venueId',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenue: {
    method: 'delete',
    // url: '/venues/:venueId',
    // newApi: true,
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenues: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue'
  },
  getVenueDetailsHeader: {
    method: 'get',
    // 500 internal server error for new api
    // url: '/venues/:venueId/detailHeaders',
    // newApi: true,
    url: '/api/viewmodel/:tenantId/venue/:venueId/detailheader'
  },
  getVenueCityList: {
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
    // url: '/aps/query',
    // newApi: true,
    url: '/api/viewmodel/:tenantId/aps/mesh'
  },
  getService: {
    method: 'get',
    url: '/api/tenant/:tenantId/service/:serviceId'
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
    url: '/files/uploadurl',
    oldUrl: '/api/file/tenant/:tenantId/upload-url',
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
    url: '/api/switch/tenant/:tenantId/switch/:serialNumber/position'
  },
  UpdateApPosition: {
    method: 'put',
    url: '/venues/aps/:serialNumber/floorPositions',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/position',
    newApi: true
  },
  UpdateCloudpathServerPosition: {
    method: 'put',
    url: '/cloudpaths/:cloudpathServerId/floorPositions',
    oldUrl: '/api/tenant/:tenantId/wifi/cloudpaths/:cloudpathServerId/floorPositions',
    newApi: true
  },
  getVenueCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
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
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/network-ap-group'
  },
  getNetworkDeepList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/get/deep'
  },
  validateRadius: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/radius/validate'
  },
  getDHCPVenueInstances: {
    method: 'get',
    url: '/api/tenant/:tenantId/dhcp-service-profile/instances/:serviceId'
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
  getRoguePolicies: {
    method: 'get',
    url: '/roguePolicies',
    oldUrl: '/api/tenant/:tenantId/wifi/rogue-policy',
    newApi: true
  },
  getVenueSyslogAp: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/syslogServerProfileSettings'
  },
  updateVenueSyslogAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/syslogServerProfileSettings'
  },
  getConfigProfiles: {
    method: 'post',
    url: '/switchProfiles/query',
    oldUrl: '/api/switch/tenant/:tenantId/profiles/query',
    newApi: true
  },
  getVenueSwitchSetting: {
    method: 'get',
    // url: '/venues/:venueId/switchSettings',
    // newApi: true,
    url: '/api/switch/tenant/:tenantId/venue/:venueId'
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue'
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
  getSwitchConfigProfile: {
    method: 'get',
    url: '/switchProfiles/:profileId',
    oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId',
    newApi: true
  },
  getPoliciesList: {
    method: 'post',
    url: '/policyProfiles',
    oldUrl: '/api/viewmodel/tenant/:tenantId/policyProfiles',
    newApi: true
  },
  getUserProfile: {
    method: 'get',
    url: '/tenants/userProfiles',
    oldUrl: '/api/tenant/:tenantId/user-profile',
    newApi: true
  },
  updateUserProfile: {
    method: 'put',
    url: '/tenants/userProfiles',
    oldUrl: '/api/tenant/:tenantId/user-profile',
    newApi: true
  },
  getApDetailHeader: {
    method: 'get',
    // new api not found
    // url: '/aps/:serialNumber/headerDetails',
    // newApi: true,
    url: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/detailheader'
  },
  getCloudVersion: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/upgrade-version'
  },
  getClientSessionHistory: {
    method: 'post',
    url: '/reports/clients/sessionHistories',
    oldUrl: '/api/reporting/tenant/:tenantId/report/clientSessionHistory',
    newApi: true
  },
  getHistoricalClientList: {
    method: 'post',
    url: '/historicalClients/query',
    oldUrl: '/api/eventalarmapi/:tenantId/event/hist_client_list',
    newApi: true
  },
  getHistoricalStatisticsReportsV2: {
    method: 'post',
    url: '/reports/clients/statistics',
    oldUrl: '/api/reporting/tenant/:tenantId/report/clientStats/v2',
    newApi: true
  },
  getGuestsList: {
    method: 'post',
    // new api not found
    // url: '/guestUsers/query',
    // newApi: true,
    url: '/api/viewmodel/tenant/:tenantId/guests'
  },
  addGuestPass: {
    method: 'post',
    url: '/guestUsers',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user',
    newApi: true
  },
  getApNetworkList: {
    method: 'post',
    // url: '/aps/:serialNumber/networks/query',
    // newApi: true,
    url: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/networks'
  },
  getExternalProviders: {
    method: 'get',
    url: '/networks/wisprProviders',
    oldUrl: '/api/tenant/:tenantId/wifi/network/external-providers',
    newApi: true
  },
  getGlobalValues: {
    method: 'get',
    url: '/api/ui/globalValues'
  },
  getCloudMessageBanner: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/banner'
  }
}
