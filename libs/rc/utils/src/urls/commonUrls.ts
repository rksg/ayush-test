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
  getApsList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps'
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
    url: '/api/viewmodel/tenant/:tenantId/serviceprofiles'
  },
  getVenuesList: {
    method: 'post',
    url: '/api/viewmodel/tenant/:tenantId/venue'
  },
  addVenue: {
    method: 'post',
    url: '/api/tenant/:tenantId/venue'
  },
  updateVenue: {
    method: 'put',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  getVenue: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenue: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  deleteVenues: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue'
  },
  getVenueDetailsHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/venue/:venueId/detailheader'
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
  saveDHCPService: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true'
  },
  getVenueFloorplans: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan'
  },
  deleteFloorPlan: {
    method: 'delete',
    url: '/api/tenant/:tenantId/venue/:venueId/floor-plan/:floorPlanId'
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
  updateVenueRogueAp: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/rogue/ap'
  },
  getRoguePolicies: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/rogue-policy'
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
  getSwitchConfigProfile: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/:profileId'
  },
  getUserProfile: {
    method: 'get',
    url: '/api/tenant/:tenantId/user-profile'
  },
  getApDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/tenant/:tenantId/ap/:serialNumber/detailheader'
  },
  getAps: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/aps'
  }
}
