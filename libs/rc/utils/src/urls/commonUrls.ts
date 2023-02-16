import { ApiInfo } from '../apiService'

export const websocketServerUrl = '/api/websocket/socket.io'

export const CommonUrlsInfo: { [key: string]: ApiInfo } = {
  getVMNetworksList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/network'
  },
  getNetworksDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/network/:networkId/detailheader'
  },
  getNetworksVenuesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/network/:networkId/venues'
  },
  getCloudpathList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/cloudpath'
  },
  getDashboardOverview: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/dashboard/overview/'
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
    url: '/api/viewmodel/:tenantId/aps'
  },
  getApGroupList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/ap-group'
  },
  getAllUserSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin-settings/ui'
  },
  getL2AclPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l2-acl-policy/query'
  },
  getL3AclPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/l3-acl-policy/query'
  },
  getDevicePolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/device-policy/query'
  },
  getApplicationPolicyList: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/application-policy/query'
  },
  getAccessControlProfileList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/access-control-profile'
  },
  getWifiCallingProfileList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/wifi-calling-profile'
  },
  getVlanPoolList: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlan-pool'
  },
  getServicesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/serviceProfiles'
  },
  getVenuesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  },
  newAddVenue: {
    method: 'post',
    newApi: true,
    url: '/venues',
    oldUrl: '/api/tenant/:tenantId/venue'
  },
  addVenue: {
    method: 'post',
    // newApi: true,
    url: '/venues',
    oldUrl: '/api/tenant/:tenantId/venue'
  },
  updateVenue: {
    method: 'put',
    // newApi: true,
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId'
  },
  getVenue: {
    method: 'get',
    // newApi: true,
    url: '/venues/:venueId',
    oldUrl: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenue: {
    method: 'delete',
    url: '/venues/:venueId',
    // newApi: true,
    oldUrl: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenues: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue'
  },
  getVenueDetailsHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/venue/:venueId/detailheader'
  },
  getVenueCityList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/venue/citylist'
  },
  getVenueSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId'
  },
  updateVenueMesh: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/mesh'
  },
  getMeshAps: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps/mesh'
  },
  getService: {
    method: 'get',
    url: '/api/tenant/:tenantId/service/:serviceId'
  },
  getFloorplan: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId'
  },
  getVenueFloorplans: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan'
  },
  addFloorplan: {
    method: 'post',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan'
  },
  updateFloorplan: {
    method: 'put',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId'
  },
  deleteFloorPlan: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId'
  },
  getUploadURL: {
    method: 'post',
    url: '/api/file/tenant/:tenantId/upload-url'
  },
  getAllDevices: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue/:venueId/devices'
  },
  UpdateSwitchPosition: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch/:serialNumber/position'
  },
  UpdateApPosition: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/position'
  },
  UpdateCloudpathServerPosition: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/cloudpaths/:cloudpathServerId/floorPositions'
  },
  getVenueCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
  },
  getVenueApModels: {
    method: 'get',
    url: '/api/viewmodel/tenant/:tenantId/venue/:venueId/ap-models'
  },
  getVenueLedOn: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/led'
  },
  updateVenueLedOn: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/led'
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/lan-port'
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/lan-port'
  },
  getVenueNetworkList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue/:venueId/networks'
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
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dos-protection'
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dos-protection'
  },
  getVenueRogueAp: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/rogue/ap'
  },
  getOldVenueRogueAp: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue/:venueId/rogue/ap'
  },
  updateVenueRogueAp: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/rogue/ap'
  },
  getRoguePolicies: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogue-policy'
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
    url: '/api/switch/tenant/:tenantId/profiles/query'
  },
  getVenueSwitchSetting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venue/:venueId'
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue'
  },
  getVenueConfigHistory: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/configurationHistory/query'
  },
  getVenueConfigHistoryDetail: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/configurationHistory/detail/:transactionId'
  },
  getSwitchConfigProfile: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/:profileId'
  },
  getPoliciesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/policyProfiles'
  },
  getUserProfile: {
    method: 'get',
    url: '/api/tenant/:tenantId/user-profile'
  },
  updateUserProfile: {
    method: 'put',
    url: '/api/tenant/:tenantId/user-profile'
  },
  getApDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/detailheader'
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
    url: '/api/viewmodel/tenant/:tenantId/guests'
  },
  addGuestPass: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/guest-user'
  },
  getApNetworkList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/networks'
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
