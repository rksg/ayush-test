import { ApiInfo } from '../apiService'

export const SwitchUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/venues/:venueId/aaaSettings',
    newApi: true
  },
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings/:aaaSettingId',
    newApi: true
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/aaaServers/query',
    newApi: true
  },
  addAaaServer: {
    method: 'post',
    url: '/venues/:venueId/aaaServer',
    newApi: true
  },
  updateAaaServer: {
    method: 'put',
    url: '/venues/:venueId/aaaServer/:aaaServerId',
    newApi: true
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers/:aaaServerId',
    newApi: true
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers',
    newApi: true
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
    url: '/switches',
    newApi: true
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId',
    newApi: true
  },
  getSwitch: {
    method: 'get',
    url: 'switches/:switchId',
    newApi: true
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
    url: '/switches/:switchId/ports',
    newApi: true
  },
  getPortsSetting: {
    method: 'post',
    url: '/switches/portSettings',
    newApi: true
  },
  getPorts: {
    method: 'post',
    url: 'switches/:switchId/portSettings',
    newApi: true
  },
  getVlansByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles/vlans',
    newApi: true
  },
  addSwitch: {
    method: 'post',
    url: '/switches',
    newApi: true
  },
  updateSwitch: {
    method: 'put',
    url: '/switches/:switchId',
    newApi: true
  },
  addStackMember: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber'
  },
  getSwitchConfigBackupList: {
    method: 'get',
    url: '/switches/:switchId/configBackups',
    newApi: true
  },
  addBackup: {
    method: 'post',
    url: '/switches/:switchId/configBackups',
    newApi: true
  },
  restoreBackup: {
    method: 'put',
    url: '/switches/configBackups/:configId/restoration',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/download/:configId'
  },
  deleteBackups: {
    method: 'delete',
    url: '/switches/configBackups',
    newApi: true
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/switches/:switchId/configHistDetails/query',
    newApi: true
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/switches/:switchId/vePorts/query',
    newApi: true
  },
  getVenueRoutedList: {
    method: 'post',
    url: '/venues/:venueId/vePorts/query',
    newApi: true
  },
  getDefaultVlan: {
    method: 'post',
    url: '/switches/vlans/query',
    newApi: true
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/switches/:switchId/vlanUnion',
    newApi: true
  },
  getSwitchVlans: {
    method: 'get',
    url: '/switches/:switchId/vlans',
    newApi: true
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/switches/vlansIntersection/query',
    newApi: true
  },
  getTaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/taggedVlans/query',
    newApi: true
  },
  getUntaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/untaggedVlans/query',
    newApi: true
  },
  getSwitchConfigurationProfileByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles',
    newApi: true
  },
  savePortsSetting: {
    method: 'put',
    url: '/switches/portSettings',
    newApi: true
  },
  getFreeVePortVlans: {
    method: 'get',
    url: '/venues/:venueId/switch/:switchId/vlans',
    newApi: true
  },
  getAclUnion: {
    method: 'get',
    url: '/switches/:switchId/aclUnions',
    newApi: true
  },
  addVePort: {
    method: 'post',
    url: '/switches/:switchId/vePorts',
    newApi: true
  },
  updateVePort: {
    method: 'put',
    url: '/switches/vePorts/:vePortId',
    newApi: true
  },
  deleteVePorts: {
    method: 'delete',
    url: '/switches/vePorts',
    newApi: true
  },
  getSwitchAcls: {
    method: 'get',
    url: '/switches/:switchId/acls',
    newApi: true
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/switches/:switchId/vlans/query',
    newApi: true
  },
  getVlanByUuid: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/vlan/:vlanUuid'
  },
  getStaticRoutes: {
    method: 'get',
    url: '/switches/:switchId/staticRoutes',
    newApi: true
  },
  addStaticRoute: {
    method: 'post',
    url: '/switches/:switchId/staticRoutes',
    newApi: true
  },
  updateStaticRoute: {
    method: 'put',
    url: '/switches/:switchId/staticRoutes/:staticRouteId',
    newApi: true
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/switches/staticRoutes',
    newApi: true
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
    url: '/switches/clients/query',
    newApi: true
  },
  getSwitchClientDetail: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/client/:clientId'
  },
  getTroubleshooting: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType'
  },
  troubleshooting: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    newApi: true
  },
  getDhcpPools: {
    method: 'post',
    url: '/switches/dhcpServers/query',
    newApi: true
  },
  addDhcpServer: {
    method: 'post',
    url: '/switches/:switchId/dhcpServers',
    newApi: true
  },
  getDhcpServer: {
    method: 'get',
    url: '/switches/dhcpServers/:dhcpServerId',
    newApi: true
  },
  updateDhcpServer: {
    method: 'put',
    url: '/switches/:switchId/dhcpServers',
    newApi: true
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/switches/:switchId/dhcpServers',
    newApi: true
  },
  getDhcpLeases: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/dhcp-server-lease-table',
    newApi: true
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
