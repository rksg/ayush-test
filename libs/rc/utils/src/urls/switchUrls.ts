import { ApiInfo } from '../apiService'

export const SwitchUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/venues/:venueId/aaaSettings'
  },
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings/:aaaSettingId'
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/aaaServers/query'
  },
  addAaaServer: {
    method: 'post',
    url: '/venues/:venueId/aaaServer'
  },
  updateAaaServer: {
    method: 'put',
    url: '/venues/:venueId/aaaServer/:aaaServerId'
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers/:aaaServerId'
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers'
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
    url: '/switches'
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId'
  },
  getSwitch: {
    method: 'get',
    url: 'switches/:switchId'
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
    method: 'post',
    url: '/switches/:switchId/ports'
  },
  getPortsSetting: {
    method: 'post',
    url: '/switches/portSettings'
  },
  getPorts: {
    method: 'post',
    url: 'switches/:switchId/portSettings'
  },
  getVlansByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles/vlans'
  },
  addSwitch: {
    method: 'post',
    url: '/switches'
  },
  updateSwitch: {
    method: 'put',
    url: '/switches/:switchId'
  },
  addStackMember: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber'
  },
  getSwitchConfigBackupList: {
    method: 'get',
    url: '/switches/:switchId/configBackups'
  },
  addBackup: {
    method: 'post',
    url: '/switches/:switchId/configBackups'
  },
  restoreBackup: {
    method: 'put',
    url: '/switches/configBackups/:configId/restoration'
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/download/:configId'
  },
  deleteBackups: {
    method: 'delete',
    url: '/switches/configBackups'
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/switches/:switchId/configHistDetails/query'
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/switches/:switchId/vePorts/query'
  },
  getVenueRoutedList: {
    method: 'post',
    url: '/venues/:venueId/vePorts/query'
  },
  getDefaultVlan: {
    method: 'post',
    url: '/switches/vlans/query'
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/switches/:switchId/vlanUnion'
  },
  getSwitchVlans: {
    method: 'get',
    url: '/switches/:switchId/vlans'
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/switches/vlansIntersection/query'
  },
  getTaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/taggedVlans/query'
  },
  getUntaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/untaggedVlans/query'
  },
  getSwitchConfigurationProfileByVenue: {
    method: 'get',
    url: '/venuees/:venueId/switchProfiles'
  },
  savePortsSetting: {
    method: 'put',
    url: '/switches/portSettings'
  },
  getFreeVePortVlans: {
    method: 'get',
    url: '/venues/:venueId/switch/:switchId/vlans'
  },
  getAclUnion: {
    method: 'get',
    url: '/switches/:switchId/aclUnions'
  },
  addVePort: {
    method: 'post',
    url: '/switches/:switchId/vePorts'
  },
  updateVePort: {
    method: 'put',
    url: '/switches/vePorts/:vePortId'
  },
  deleteVePorts: {
    method: 'delete',
    url: '/switches/vePorts'
  },
  getSwitchAcls: {
    method: 'get',
    url: '/switches/:switchId/acls'
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/switches/:switchId/vlans/query'
  },
  getVlanByUuid: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlan/:vlanUuid'
  },
  getStaticRoutes: {
    method: 'get',
    url: '/switches/:switchId/staticRoutes'
  },
  addStaticRoute: {
    method: 'post',
    url: '/switches/:switchId/staticRoutes'
  },
  updateStaticRoute: {
    method: 'put',
    url: '/switches/:switchId/staticRoutes/:staticRouteId'
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/switches/staticRoutes'
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
    url: '/switches/:switchId/debugRequests/:troubleshootingType'
  },
  getTroubleshootingClean: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType'
  },
  ping: {
    method: 'post',
    url: '/switches/:switchId/debugRequests'
  },
  traceRoute: {
    method: 'post',
    url: '/switches/:switchId/debugRequests'
  },
  ipRoute: {
    method: 'post',
    url: '/switches/:switchId/debugRequests'
  },
  macAddressTable: {
    method: 'post',
    url: '/switches/:switchId/debugRequests'
  },
  getDhcpPools: {
    method: 'post',
    url: '/switches/dhcpServers/query'
  },
  addDhcpServer: {
    method: 'post',
    url: '/switches/:switchId/dhcpServers'
  },
  getDhcpServer: {
    method: 'get',
    url: '/switches/dhcpServers/:dhcpServerId'
  },
  updateDhcpServer: {
    method: 'put',
    url: '/switches/:switchId/dhcpServers'
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/switches/:switchId/dhcpServers'
  },
  getDhcpLeases: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/dhcp-server-lease-table'
  },
  dhcpLeaseTable: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable'
  },
  updateDhcpServerState: {
    method: 'post',
    url: '/switches/:switchId/dhcpServerStateSettings'
  }
}
