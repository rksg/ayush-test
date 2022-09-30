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
  getVenue: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/:venueId'
  },
  getVenueDetailsHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/venue/:venueId/detailheader'
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
  }
}
