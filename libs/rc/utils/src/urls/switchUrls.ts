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
  getSwitch: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId'
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
  getSwitchConfigBackupList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId'
  },
  restoreBackup: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/configBackup/restore/:configId'
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/download/:configId'
  },
  deleteBackups: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/configBackup'
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switches/:switchId/configurationHistory/detail/query'
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vePort/switch/:switchId/query'
  },
  getVenueRoutedList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vePort/venue/:venueId/query'
  },
  getFreeVePortVlans: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlanVePort/:venueId/switch/:switchId'
  },
  getAclUnion: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/aclUnion/switch/:switchId'
  },
  addVePort: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vePort/switch/:switchId'
  },
  updateVePort: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/vePort'
  },
  deleteVePorts: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/vePorts'
  },
  getSwitchAcls: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/acls/switch/:switchId'
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vlans/switch/:switchId/query'
  },
  getVlanByUuid: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlan/:vlanUuid'
  }
}
