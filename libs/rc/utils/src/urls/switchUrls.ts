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
  getPortSetting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/port/switch/:switchId/portId/:portIdentifier'
  },
  getPortsSetting: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/port/switches/ports'
  },
  getPorts: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/ports'
  },
  getVlansByVenue: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId'
  },
  addSwitch: {
    method: 'post',
    // url: '/switches',
    url: '/api/switch/tenant/:tenantId/switch'
    // newApi: true
  },
  updateSwitch: {
    method: 'put',
    // url: '/switches/:switchId',
    url: '/api/switch/tenant/:tenantId/switch'
    // newApi: true
  },
  addStackMember: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber'
  },
  getSwitchConfigBackupList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId'
  },
  addBackup: {
    method: 'post',
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
  getDefaultVlan: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/defaultVlan/switches'
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlanUnion/switch/:switchId'
  },
  getSwitchVlans: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlans/switch/:serialNumber'
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/vlanIntersection/switches'
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
  },
  getStaticRoutes: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId'
  },
  addStaticRoute: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId'
  },
  updateStaticRoute: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/staticRoute'
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/staticRoutes'
  },
  reboot: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/reboot'
  },
  syncData: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/sync'
  },
  getJwtToken: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:serialNumber/jwt-token'
  },
  getSwitchClientList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/switch/client/clientlist'
  },
  getSwitchClientDetail: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/client/:clientId'
  },
  getTroubleshooting: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingResult/:troubleshootingType'
  },
  getTroubleshootingClean: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType'
  },
  ping: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/ping'
  },
  traceRoute: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/trace-route'
  },
  ipRoute: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/route-table'
  },
  macAddressTable: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/mac-address-table'
  },
  getDhcpPools: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/query'
  },
  addDhcpServer: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer'
  },
  getDhcpServer: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/dhcpServer/:dhcpServerId'
  },
  updateDhcpServer: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer'
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServers'
  },
  getDhcpLeases: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/'+
      'troubleshootingResult/dhcp-server-lease-table'
  },
  dhcpLeaseTable: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable'
  },
  updateDhcpServerState: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/state'
  },
  getProfiles: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/profiles/query'
  },
  getCliTemplates: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/cli-template/query'
  },
  getLagList: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/lag/switch/:switchId'
  },
  updateLag: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/lag'
  },
  addLag: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/lag/switch/:switchId'
  },
  deleteLag: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/lag/:lagId'
  }
}
