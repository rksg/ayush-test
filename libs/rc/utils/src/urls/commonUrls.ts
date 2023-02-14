import { ApiInfo } from '../apiService'

export const websocketServerUrl = '/api/websocket/socket.io'

export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/networks/query',
    newApi: true
  },
  getNetworksDetailHeader: {
    method: 'get',
    url: '/networks/:networkId/headerDetails',
    newApi: true
  },
  getNetworksVenuesList: {
    method: 'post',
    url: '/networks/:networkId/venues',
    newApi: true
  },
  getCloudpathList: {
    method: 'get',
    url: '/cloudpaths',
    newApi: true
  },
  getDashboardOverview: {
    method: 'get',
    url: '/dashboards/overviews/',
    newApi: true
  },
  getAlarmsList: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/alarm/alarmlist'
  },
  getAlarmsListMeta: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/alarm/meta'
  },
  getActivityList: {
    method: 'post',
    url: '/api/tenant/:tenantId/activity/query'
  },
  getEventList: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/event/eventlist'
  },
  getEventListMeta: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/event/meta'
  },
  clearAlarm: {
    method: 'delete',
    url: '/api/eventalarmapi/:tenantId/alarm/clear/:alarmId'
  },
  clearAllAlarm: {
    method: 'delete',
    url: '/api/eventalarmapi/:tenantId/alarm'
  },
  getApsList: {
    method: 'post',
    url: '/aps/query',
    newApi: true
  },
  getApGroupList: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },
  getAllUserSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin-settings/ui'
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/l2AclPolicies/query',
    newApi: true
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/l3AclPolicies/query',
    newApi: true
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/devicePolicies/query',
    newApi: true
  },
  getApplicationPolicyList: {
    method: 'post',
    url: '/applicationPolicies/query',
    newApi: true
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/accessControlProfiles',
    newApi: true
  },
  getWifiCallingProfileList: {
    method: 'get',
    url: '/wifiCallingProfiles',
    newApi: true
  },
  getVlanPoolList: {
    method: 'get',
    url: '/vlanPools',
    newApi: true
  },
  getServicesList: {
    method: 'post',
    url: '/serviceProfiles',
    newApi: true
  },
  getVenuesList: {
    method: 'post',
    url: '/venues/query',
    newApi: true
  },
  addVenue: {
    method: 'post',
    newApi: true,
    url: '/venues'
  },
  updateVenue: {
    method: 'put',
    newApi: true,
    url: '/venues/:venueId'
  },
  getVenue: {
    method: 'get',
    newApi: true,
    url: '/venues/:venueId'
  },
  deleteVenue: {
    method: 'delete',
    url: '/venues/:venueId',
    newApi: true
  },
  deleteVenues: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue'
  },
  getVenueDetailsHeader: {
    method: 'get',
    url: '/venues/:venueId/detailHeaders',
    newApi: true
  },
  getVenueSettings: {
    method: 'get',
    url: '/venues/:venueId/wifiSettings',
    newApi: true
  },
  updateVenueMesh: {
    method: 'put',
    url: '/venues/:venueId/meshSettings',
    newApi: true
  },
  getMeshAps: {
    method: 'post',
    url: '/aps/query',
    newApi: true
  },
  getService: {
    method: 'get',
    url: '/api/tenant/:tenantId/service/:serviceId'
  },
  getFloorplan: {
    method: 'get',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    newApi: true
  },
  getVenueFloorplans: {
    method: 'get',
    url: '/venues/:venueId/floorplans',
    newApi: true
  },
  addFloorplan: {
    method: 'post',
    url: '/venues/:venueId/floorplans',
    newApi: true
  },
  updateFloorplan: {
    method: 'put',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    newApi: true
  },
  deleteFloorPlan: {
    method: 'delete',
    url: '/venues/:venueId/floorplans/:floorPlanId',
    newApi: true
  },
  getUploadURL: {
    method: 'post',
    url: '/files/uploadurl',
    newApi: true
  },
  getAllDevices: {
    method: 'post',
    url: '/venues/:venueId/devices',
    newApi: true
  },
  UpdateSwitchPosition: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch/:serialNumber/position'
  },
  UpdateApPosition: {
    method: 'put',
    url: '/venues/aps/:serialNumber/floorPositions',
    newApi: true
  },
  UpdateCloudpathServerPosition: {
    method: 'put',
    url: '/cloudpaths/:cloudpathServerId/floorPositions',
    newApi: true
  },
  getVenueCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
  },
  getVenueApModels: {
    method: 'get',
    url: '/venues/:venueId/apModels',
    newApi: true
  },
  getVenueLedOn: {
    method: 'get',
    url: '/venues/:venueId/ledSettings',
    newApi: true
  },
  updateVenueLedOn: {
    method: 'put',
    url: '/venues/:venueId/ledSettings',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/venues/:venueId/lanPortSettings',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/venues/:venueId/lanPortSettings',
    newApi: true
  },
  getVenueNetworkList: {
    method: 'post',
    url: '/venues/:venueId/networks/query',
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
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  getVenueRogueAp: {
    method: 'get',
    url: '/venues/:venueId/rogueApSettings',
    newApi: true
  },
  getOldVenueRogueAp: {
    method: 'post',
    url: '/venues/:venueId/rogueAps/query',
    newApi: true
  },
  updateVenueRogueAp: {
    method: 'put',
    url: '/venues/:venueId/rogueApSettings',
    newApi: true
  },
  getRoguePolicies: {
    method: 'get',
    url: '/roguePolicies',
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
    newApi: true
  },
  getVenueSwitchSetting: {
    method: 'get',
    url: '/venues/:venueId/switchSettings',
    newApi: true
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue'
  },
  getVenueConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/configHistories/query',
    newApi: true
  },
  getVenueConfigHistoryDetail: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/configurationHistory/detail/:transactionId'
  },
  getSwitchConfigProfile: {
    method: 'get',
    url: '/switchProfiles/:switchProfileId',
    newApi: true
  },
  getPoliciesList: {
    method: 'post',
    url: '/policyProfiles',
    newApi: true
  },
  getUserProfile: {
    method: 'get',
    url: '/tenants/userProfiles',
    newApi: true
  },
  updateUserProfile: {
    method: 'put',
    url: '/tenants/userProfiles',
    newApi: true
  },
  getApDetailHeader: {
    method: 'get',
    url: '/aps/:serialNumber/headerDetails',
    newApi: true
  },
  getCloudVersion: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/upgrade-version'
  },
  getClientSessionHistory: {
    method: 'post',
    url: '/api/reporting/tenant/:tenantId/report/clientSessionHistory'
  },
  getHistoricalClientList: {
    method: 'post',
    url: '/api/eventalarmapi/:tenantId/event/hist_client_list'
  },
  getHistoricalStatisticsReportsV2: {
    method: 'post',
    url: '/api/reporting/tenant/:tenantId/report/clientStats/v2'
  },
  getGuestsList: {
    method: 'post',
    url: '/guestUsers/query',
    newApi: true
  },
  addGuestPass: {
    method: 'post',
    url: '/guestUsers',
    newApi: true
  },
  getApNetworkList: {
    method: 'post',
    url: '/aps/:serialNumber/networks/query'
  },
  getExternalProviders: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/network/external-providers'
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
