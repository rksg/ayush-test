import { ApiInfo } from '../apiService'

export const SwitchUrlsInfo: { [key: string]: ApiInfo } = {
  getAaaSetting: {
    method: 'get',
    url: '/venues/:venueId/aaaSettings',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting',
    newApi: true
  },
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings/:aaaSettingId',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting',
    newApi: true
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/aaaServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
    newApi: true
  },
  addAaaServer: {
    method: 'post',
    url: '/venues/:venueId/aaaServer',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
    newApi: true
  },
  updateAaaServer: {
    method: 'put',
    url: '/venues/:venueId/aaaServer/:aaaServerId',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
    newApi: true
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers/:aaaServerId',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/:aaaServerId',
    newApi: true
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/aaaServers',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer',
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
    oldUrl: '/api/switch/tenant/:tenantId/switches',
    newApi: true
  },
  deleteStackMember: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/stack/:stackSwitchSerialNumber'
  },
  acknowledgeSwitch: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/ack'
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId'
  },
  getSwitch: {
    method: 'get',
    url: '/switches/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId',
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
    // different method
    // method: 'post',
    // url: '/switches/:switchId/ports',
    // newApi: true,
    method: 'get',
    url: '/api/switch/tenant/:tenantId/port/switch/:switchId/portId/:portIdentifier'
  },
  getPortsSetting: {
    method: 'post',
    url: '/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches/ports',
    newApi: true
  },
  getPorts: {
    method: 'post',
    url: 'switches/:switchId/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/ports',
    newApi: true
  },
  getVlansByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId',
    newApi: true
  },
  addSwitch: {
    // method: 'post',
    // url: '/switches',
    // oldUrl: '/api/switch/tenant/:tenantId/switch',
    // newApi: true
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch'
  },
  updateSwitch: {
    // method: 'put',
    // url: '/switches/:switchId',
    // oldUrl: '/api/switch/tenant/:tenantId/switch',
    // newApi: true
    method: 'put',
    url: '/api/switch/tenant/:tenantId/switch'
  },
  convertToStack: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/ConvertToStack'
  },
  addStackMember: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber'
  },
  getSwitchConfigBackupList: {
    method: 'post',
    url: '/switches/:switchId/configBackups/query',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId/query',
    newApi: true
  },
  addBackup: {
    method: 'post',
    url: '/switches/:switchId/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId',
    newApi: true
  },
  restoreBackup: {
    method: 'put',
    url: '/switches/configBackups/:configId/restoration',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/restore/:configId',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/configBackup/download/:configId'
  },
  deleteBackups: {
    method: 'delete',
    url: '/switches/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup',
    newApi: true
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/switches/:switchId/configHistDetails/query',
    oldUrl: '/api/switch/tenant/:tenantId/switches/:switchId/configurationHistory/detail/query',
    newApi: true
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/switches/:switchId/vePorts/query',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId/query',
    newApi: true
  },
  getVenueRoutedList: {
    method: 'post',
    url: '/venues/:venueId/vePorts/query',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/venue/:venueId/query',
    newApi: true
  },
  getDefaultVlan: {
    method: 'post',
    url: '/switches/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/defaultVlan/switches',
    newApi: true
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/switches/:switchId/vlanUnions',
    oldUrl: '/api/switch/tenant/:tenantId/vlanUnion/switch/:switchId',
    newApi: true
  },
  getSwitchVlans: {
    method: 'get',
    url: '/switches/:switchId/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId',
    newApi: true
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/switches/vlansIntersection/query',
    oldUrl: '/api/switch/tenant/:tenantId/vlanIntersection/switches',
    newApi: true
  },
  getTaggedVlansByVenue: {
    // different method
    // method: 'post',
    // url: '/venues/:venueId/taggedVlans/query',
    // oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/tagged/:port',
    // newApi: true
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/tagged/:port'
  },
  getUntaggedVlansByVenue: {
    // different method
    // method: 'post',
    // url: '/venues/:venueId/untaggedVlans/query',
    // oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/untagged/:port',
    // newApi: true
    method: 'get',
    url: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/untagged/:port'
  },
  getSwitchConfigurationProfileByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles',
    oldUrl: '/api/switch/tenant/:tenantId/profiles/venue/:venueId',
    newApi: true
  },
  savePortsSetting: {
    method: 'put',
    url: '/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches',
    newApi: true
  },
  getFreeVePortVlans: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/vlanVePort/:venueId/switch/:switchId',
    newApi: true
  },
  getAclUnion: {
    method: 'get',
    url: '/switches/:switchId/aclUnions',
    oldUrl: '/api/switch/tenant/:tenantId/aclUnion/switch/:switchId',
    newApi: true
  },
  addAcl: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/profile/:profileId/acl'
  },
  addVePort: {
    method: 'post',
    url: '/switches/:switchId/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId',
    newApi: true
  },
  updateVePort: {
    method: 'put',
    url: '/switches/vePorts/:vePortId',
    oldUrl: '/api/switch/tenant/:tenantId/vePort',
    newApi: true
  },
  deleteVePorts: {
    method: 'delete',
    url: '/switches/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePorts',
    newApi: true
  },
  getSwitchAcls: {
    method: 'post',
    url: '/switches/:switchId/acls/query',
    oldUrl: '/api/switch/tenant/:tenantId/acls/switch/:switchId/query',
    newApi: true
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/switches/:switchId/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId/query',
    newApi: true
  },
  getVlanByUuid: {
    method: 'get',
    url: '/switches/vlans/:vlanUuid',
    oldUrl: '/api/switch/tenant/:tenantId/vlan/:vlanUuid',
    newApi: true
  },
  getStaticRoutes: {
    method: 'get',
    url: '/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  addStaticRoute: {
    method: 'post',
    url: '/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  updateStaticRoute: {
    method: 'put',
    url: '/switches/staticRoutes/:staticRouteId',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute',
    newApi: true
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/switches/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoutes',
    newApi: true
  },
  reboot: {
    method: 'post',
    url: '/switches/:switchId/deviceRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/reboot',
    newApi: true
  },
  syncData: {
    method: 'post',
    url: '/switches/:switchId/deviceRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/sync',
    newApi: true
  },
  getJwtToken: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:serialNumber/jwt-token'
  },
  getSwitchClientList: {
    method: 'post',
    url: '/switches/clients/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/client/clientlist',
    newApi: true
  },
  getSwitchClientDetail: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/client/:clientId'
  },
  getTroubleshooting: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/:troubleshootingType',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingResult' +
      '/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType'
  },
  ping: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/ping',
    newApi: true
  },
  traceRoute: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/trace-route',
    newApi: true
  },
  ipRoute: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/route-table',
    newApi: true
  },
  macAddressTable: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/mac-address-table',
    newApi: true
  },
  getDhcpPools: {
    method: 'post',
    url: '/switches/:switchId/dhcpServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/query',
    newApi: true
  },
  addDhcpServer: {
    method: 'post',
    url: '/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    newApi: true
  },
  getDhcpServer: {
    method: 'get',
    url: '/switches/dhcpServers/:dhcpServerId',
    oldUrl: '/api/switch/tenant/:tenantId/dhcpServer/:dhcpServerId',
    newApi: true
  },
  updateDhcpServer: {
    method: 'put',
    url: '/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    newApi: true
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServers',
    newApi: true
  },
  getDhcpLeases: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/dhcp-server-lease-table',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/'+
      'troubleshootingResult/dhcp-server-lease-table',
    newApi: true
  },
  dhcpLeaseTable: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable'
  },
  updateDhcpServerState: {
    method: 'post',
    url: '/switches/:switchId/dhcpServerStateSettings',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/state',
    newApi: true
  },
  getSwitchProfileList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/switch/profilelist'
  },
  addSwitchConfigProfile: {
    method: 'post',
    url: '/switchProfiles',
    oldUrl: '/api/switch/tenant/:tenantId/profile',
    newApi: true
  },
  updateSwitchConfigProfile: {
    method: 'put',
    url: '/switchProfiles/:profileId',
    oldUrl: '/api/switch/tenant/:tenantId/profile',
    newApi: true
  },
  getSwitchFrontView: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId/ports?unitid=:unitId'
  },
  getSwitchRearView: {
    method: 'get',
    url: '/api/viewmodel/:tenantId/switch/:switchId/rear?unitid=:unitId'
  },
  addCliTemplate: {
    method: 'post',
    url: '/cliTemplates',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template',
    newApi: true
  },
  getCliConfigExamples: {
    method: 'get',
    url: '/cliTemplates/examples',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template/example',
    newApi: true
  },
  getProfiles: {
    method: 'post',
    url: '/switchProfiles/query',
    oldUrl: '/api/switch/tenant/:tenantId/profiles/query',
    newApi: true
  },
  getSwitchConfigProfile: {
    method: 'get',
    url: '/switchProfiles/:profileId',
    oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId',
    newApi: true
  },
  getCliFamilyModels: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/cliProfile/familyModels'
  },
  deleteProfiles: {
    method: 'delete',
    url: '/switchProfiles',
    oldUrl: '/api/switch/tenant/:tenantId/profiles',
    newApi: true
  },
  getCliTemplates: {
    method: 'post',
    url: '/cliTemplates/query',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template/query',
    newApi: true
  },
  deleteCliTemplates: {
    method: 'delete',
    url: '/cliTemplates',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template',
    newApi: true
  },
  getCliTemplate: {
    method: 'get',
    url: '/cliTemplates/:templateId',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template/:templateId',
    newApi: true
  },
  updateCliTemplate: {
    method: 'put',
    url: '/cliTemplates/:templateId',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template',
    newApi: true
  },
  getLagList: {
    method: 'get',
    url: '/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  updateLag: {
    method: 'put',
    url: '/switches/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag',
    newApi: true
  },
  addLag: {
    method: 'post',
    url: '/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  deleteLag: {
    method: 'delete',
    url: '/switches/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag/:lagId',
    newApi: true
  }
}
