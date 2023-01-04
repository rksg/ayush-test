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
  getSwitchList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/switch/switchlist'
  },
  getMemberList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/switch/memberlist'
  },
  deleteSwitches: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/switches'
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
  getVlansByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId'
  },
  addSwitch: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch'
  },
  addStackMember: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber'
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switches/:switchId/configurationHistory/detail/query'
  }
}
