import { ApiInfo } from '../apiService'

export const SwitchUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting'
  },
  updateAaaSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting'
  },
  getAaaServerList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/aaaServer/query'
  },
  addAaaServer: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer'
  },
  updateAaaServer: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer'
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/aaaServer/:aaaServerId'
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/aaaServer'
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId'
  },
  getSwitchPortlist: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/switch/portlist'
  },
  importSwitches: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/import'
  },
  getPortSetting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/portId/:portIdentifier'
  },
  getPortsSetting: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/port/switches/ports'
  },
  getPorts: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/ports'
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vePort/switch/:switchId/query' //'/api/viewmodel/:tenantId/switch/routedlist'
  },
  getVenueRoutedList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vePort/venue/:venueId/query'
  },
  getAclUnion: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/aclUnion/switch/:serialNumber'
  },
  getDefaultVlan: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/defaultVlan/switches'
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlanUnion/switch/:serialNumber'
  },
  getSwitchVlans: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlans/switch/:serialNumber'
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vlanIntersection/switches'
  },
  getVlansByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId'
  },
  getTaggedVlansByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/tagged/:port'
  },
  getUntaggedVlansByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/untagged/:port'
  },
  getSwitchConfigurationProfileByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profiles/venue/:venueId'
  },
  savePortsSetting: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/port/switches'
  }
}
