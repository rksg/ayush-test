import { ApiInfo } from '@acx-ui/utils'

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
    url: '/venues/:venueId/aaaServers',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
    newApi: true
  },
  updateAaaServer: {
    method: 'put',
    url: '/venues/:venueId/aaaServers/:aaaServerId',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
    opsApi: 'PUT:/venues/{id}/aaaServers/{id}',
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
    url: '/switches/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/switchlist',
    newApi: true
  },
  getSwitchListByGroup: {
    method: 'post',
    url: '/switches/aggregationDetails',
    oldUrl: '/api/viewmodel/:tenantId/switch/grouped',
    newApi: true
  },
  getSwitchModelList: {
    method: 'post',
    url: '/switches/models/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/modellist',
    newApi: true
  },
  getMemberList: {
    method: 'post',
    url: '/switches/members/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/memberlist',
    newApi: true
  },
  deleteSwitches: {
    method: 'delete',
    url: '/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switches',
    newApi: true
  },
  deleteStackMember: {
    method: 'delete',
    url: '/stacks/:stackSwitchSerialNumber',
    oldUrl: '/api/switch/tenant/:tenantId/stack/:stackSwitchSerialNumber',
    newApi: true
  },
  acknowledgeSwitch: {
    method: 'put',
    url: '/stacks/:switchId/acks',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/ack',
    newApi: true
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/switches/:switchId/configurations',
    oldUrl: '/api/viewmodel/:tenantId/switch/:switchId',
    newApi: true
  },
  getSwitch: {
    method: 'get',
    url: '/switches/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId',
    newApi: true
  },
  getSwitchPortlist: {
    method: 'post',
    url: '/switches/ports/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/portlist',
    newApi: true
  },
  importSwitches: {
    method: 'post',
    url: '/venues/switches',
    oldUrl: '/api/switch/tenant/:tenantId/import',
    newApi: true
  },
  getPortSetting: {
    method: 'post',
    url: '/switches/:switchId/portSettings',
    oldMethod: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:switchId/portId/:portIdentifier',
    newApi: true
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
  portsPowerCycle: {
    method: 'post',
    url: '/venues/:venueId/switches/powerCycleRequests',
    newApi: true
  },
  getVlansByVenue: {
    method: 'get',
    url: '/venues/:venueId/switchProfiles/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId',
    newApi: true
  },
  addSwitch: {
    method: 'post',
    url: '/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  updateSwitch: {
    method: 'put',
    url: '/switches/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  convertToStack: {
    method: 'post',
    url: '/switches/convertToStack',
    oldUrl: '/api/switch/tenant/:tenantId/switch/ConvertToStack',
    newApi: true
  },
  addStackMember: {
    method: 'post',
    url: '/stacks/:stackSerialNumber/members/:newStackMemberSerialNumber',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber',
    newApi: true
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
    url: '/switches/configBackups/:configId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/restore/:configId',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/switches/configBackupDownloads/:configId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/download/:configId',
    newApi: true
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
  getSwitchVlanUnionByVenue: {
    method: 'get',
    url: '/venues/:venueId/vlanUnions',
    oldUrl: '/api/switch/tenant/:tenantId/switchVlanUnion/venue/:venueId',
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
  addSwitchVlans: {
    method: 'post',
    url: '/switches/:switchId/vlans',
    newApi: true
  },
  deleteSwitchVlan: {
    method: 'delete',
    url: '/switches/vlans/:vlanId',
    newApi: true
  },
  updateSwitchVlan: {
    method: 'put',
    url: '/switches/vlans/:vlanId',
    newApi: true
  },
  addSwitchesVlans: {
    method: 'post',
    url: '/switches/vlans',
    newApi: true
  },
  getSwitchesVlan: {
    method: 'post',
    url: '/switches/vlansIntersection/query',
    oldUrl: '/api/switch/tenant/:tenantId/vlanIntersection/switches',
    newApi: true
  },
  getTaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/taggedVlans/query',
    oldMethod: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/tagged/:port',
    newApi: true
  },
  getUntaggedVlansByVenue: {
    method: 'post',
    url: '/venues/:venueId/untaggedVlans/query',
    oldMethod: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/untagged/:port',
    newApi: true
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
    url: '/switchProfiles/:profileId/acls',
    oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId/acl',
    opsApi: 'POST:/switchProfiles/{id}/acls',
    newApi: true
  },
  addVlan: {
    method: 'post',
    url: '/switchProfiles/:profileId/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId/vlan',
    opsApi: 'POST:/switchProfiles/{id}/vlans',
    newApi: true
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
  syncSwitchesData: {
    method: 'post',
    url: '/switches/deviceRequests',
    newApi: true
  },
  retryFirmwareUpdate: {
    method: 'post',
    url: '/switches/:switchId/firmwareUpgrade',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/upgrade',
    newApi: true
  },
  getJwtToken: {
    method: 'get',
    url: '/switches/:serialNumber/jwtToken',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:serialNumber/jwt-token',
    newApi: true
  },
  getSwitchClientList: {
    method: 'post',
    url: '/switches/clients/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/client/clientlist',
    newApi: true
  },
  getSwitchClientDetail: {
    method: 'post',
    url: '/switches/clients/query',
    oldMethod: 'get',
    oldUrl: '/api/viewmodel/:tenantId/switch/client/:clientId',
    newApi: true
  },
  getTroubleshooting: {
    method: 'get',
    url: '/switches/:switchId/debugRequests/:troubleshootingType',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingResult' +
      '/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'delete',
    url: '/switches/:switchId/debugRequests/:troubleshootingType',
    oldMethod: 'get',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType',
    newApi: true
  },
  debugRequests: {
    method: 'post',
    url: '/switches/:switchId/debugRequests',
    newApi: true
  },
  blinkLeds: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    opsApi: 'POST:/venues/{id}/switches/{id}/debugRequests',
    newApi: true
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
    url: '/switches/:switchId/dhcpServers/leaseTables',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable',
    newApi: true
  },
  updateDhcpServerState: {
    method: 'post',
    url: '/switches/:switchId/dhcpServerStateSettings',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/state',
    newApi: true
  },
  addSwitchConfigProfile: {
    method: 'post',
    url: '/switchProfiles',
    oldUrl: '/api/switch/tenant/:tenantId/profile',
    opsApi: 'POST:/switchProfiles',
    newApi: true
  },
  updateSwitchConfigProfile: {
    method: 'put',
    url: '/switchProfiles/:profileId',
    oldUrl: '/api/switch/tenant/:tenantId/profile',
    opsApi: 'PUT:/switchProfiles/{id}',
    newApi: true
  },
  getSwitchFrontView: {
    method: 'get',
    url: '/switches/:switchId/ports?unitid=:unitId',
    oldUrl: '/api/viewmodel/:tenantId/switch/:switchId/ports?unitid=:unitId',
    newApi: true
  },
  getSwitchRearView: {
    method: 'get',
    url: '/switches/:switchId/rearDetails?unitid=:unitId',
    oldUrl: '/api/viewmodel/:tenantId/switch/:switchId/rear?unitid=:unitId',
    newApi: true
  },
  addCliTemplate: {
    method: 'post',
    url: '/cliTemplates',
    oldUrl: '/api/switch/tenant/:tenantId/cli-template',
    opsApi: 'POST:/cliTemplates',
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
    oldUrl: '/api/switch/tenant/:tenantId/cliProfile/familyModels',
    url: '/cliProfiles/familyModels',
    newApi: true
  },
  deleteProfiles: {
    method: 'delete',
    url: '/switchProfiles',
    oldUrl: '/api/switch/tenant/:tenantId/profiles',
    opsApi: 'DELETE:/switchProfiles',
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
    opsApi: 'DELETE:/cliTemplates',
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
    opsApi: 'PUT:/cliTemplates/{id}',
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
  },
  getSwitchConfigProfileDetail: {
    method: 'get',
    url: '/switchProfiles/:profileId',
    oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId',
    newApi: true
  },
  downloadSwitchsCSV: {
    method: 'post',
    url: '/switches/query/csvFiles',
    oldUrl: '/switches/query/csvFiles',
    newApi: true
  },
  addFlexAuthenticationProfile: {
    method: 'post',
    url: '/switchAuthProfiles',
    opsApi: 'POST:/switchAuthProfiles',
    newApi: true
  },
  getFlexAuthenticationProfiles: {
    method: 'post',
    url: '/switchAuthProfiles/query',
    opsApi: 'POST:/switchAuthProfiles/query',
    newApi: true
  },
  getFlexAuthenticationProfileAppliedTargets: {
    method: 'post',
    url: '/switchAuthProfiles/:profileId/appliedTargets/query',
    newApi: true
  },
  updateFlexAuthenticationProfile: {
    method: 'put',
    url: '/switchAuthProfiles/:profileId',
    opsApi: 'PUT:/switchAuthProfiles/{id}',
    newApi: true
  },
  deleteFlexAuthenticationProfile: {
    method: 'delete',
    url: '/switchAuthProfiles/:profileId',
    opsApi: 'DELETE:/switchAuthProfiles/{id}',
    newApi: true
  },
  getSwitchAuthentication: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/authentications',
    newApi: true
  },
  getSwitchesAuthentication: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/authentication',
    newApi: true
  },
  updateSwitchAuthentication: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/authentications',
    newApi: true
  },
  getSwitchFeatureSets: {
    method: 'post',
    url: '/switchFeatureSets/query',
    newApi: true
  },
  getSwitchPortProfilesList: {
    method: 'post',
    url: '/switchPortProfiles/portProfiles/query',
    opsApi: 'POST:/switchPortProfiles/portProfiles/query',
    newApi: true
  },
  getSwitchPortProfilesCount: {
    method: 'get',
    url: '/switchPortProfiles/portProfiles/totalAmounts',
    newApi: true
  },
  addSwitchPortProfile: {
    method: 'post',
    opsApi: 'POST:/switchPortProfiles/portProfiles',
    url: '/switchPortProfiles/portProfiles',
    newApi: true
  },
  editSwitchPortProfile: {
    method: 'put',
    url: '/switchPortProfiles/portProfiles/:portProfileId',
    opsApi: 'PUT:/switchPortProfiles/portProfiles/{id}',
    newApi: true
  },
  deleteSwitchPortProfile: {
    method: 'delete',
    url: '/switchPortProfiles/portProfiles/:portProfileId',
    opsApi: 'DELETE:/switchPortProfiles/portProfiles/{id}',
    newApi: true
  },
  getSwitchPortProfileDetail: {
    method: 'get',
    url: '/switchPortProfiles/portProfiles/:portProfileId',
    newApi: true
  },
  getSwitchPortProfileAppliedList: {
    method: 'post',
    url: '/switchPortProfiles/portProfiles/:portProfileId/appliedSwitches/query',
    newApi: true
  },
  getSwitchPortProfileMacOuisList: {
    method: 'post',
    url: '/switchPortProfiles/macOuis/query',
    opsApi: 'POST:/switchPortProfiles/macOuis/query',
    newApi: true
  },
  addSwitchPortProfileMacOui: {
    method: 'post',
    url: '/switchPortProfiles/macOuis',
    opsApi: 'POST:/switchPortProfiles/macOuis',
    newApi: true
  },
  editSwitchPortProfileMacOui: {
    method: 'put',
    url: '/switchPortProfiles/macOuis/:macOuiId',
    opsApi: 'PUT:/switchPortProfiles/macOuis/{id}',
    newApi: true
  },
  deleteSwitchPortProfileMacOui: {
    method: 'delete',
    url: '/switchPortProfiles/macOuis/:macOuiId',
    opsApi: 'DELETE:/switchPortProfiles/macOuis/{id}',
    newApi: true
  },
  getSwitchPortProfileLldpTlvsList: {
    method: 'post',
    url: '/switchPortProfiles/lldpTlvs/query',
    opsApi: 'POST:/switchPortProfiles/lldpTlvs/query',
    newApi: true
  },
  addSwitchPortProfileLldpTlv: {
    method: 'post',
    url: '/switchPortProfiles/lldpTlvs',
    opsApi: 'POST:/switchPortProfiles/lldpTlvs',
    newApi: true
  },
  editSwitchPortProfileLldpTlv: {
    method: 'put',
    url: '/switchPortProfiles/lldpTlvs/:lldpTlvId',
    opsApi: 'PUT:/switchPortProfiles/lldpTlvs/{id}',
    newApi: true
  },
  deleteSwitchPortProfileLldpTlv: {
    method: 'delete',
    url: '/switchPortProfiles/lldpTlvs/:lldpTlvId',
    opsApi: 'DELETE:/switchPortProfiles/lldpTlvs/{id}',
    newApi: true
  },
  getPortProfileOptionsForMultiSwitches: {
    method: 'post',
    url: '/venues/:venueId/switches/availablePortProfiles',
    newApi: true
  },
  getPortProfilesListBySwitchId: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/switchPortProfiles/query',
    newApi: true
  },
  getPortDisableRecovery: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/portDisableRecoverySetting',
    newApi: true
  },
  updatePortDisableRecovery: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/portDisableRecoverySetting',
    newApi: true
  },
  getAccessControls: {
    method: 'post',
    url: '/switchL2AclPolicies/query',
    newApi: true
  },
  getAccessControl: {
    method: 'post',
    url: '/switchL2AclPolicies/l2AclPolicyRules/:l2AclPolicyId',
    newApi: true
  },
  addAccessControl: {
    method: 'post',
    url: '/switchL2AclPolicies',
    newApi: true
  },
  updateAccessControl: {
    method: 'put',
    url: '/switchL2AclPolicies/:l2AclId',
    newApi: true
  },
  deleteAccessControl: {
    method: 'delete',
    url: '/switchL2AclPolicies/:l2AclId',
    newApi: true
  },
  getSwitchMacAcls: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/macAcls/query',
    newApi: true
  },
  addSwitchMacAcl: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/macAcls',
    newApi: true
  },
  updateSwitchMacAcl: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/macAcls/:macAclId',
    newApi: true
  },
  deleteSwitchMacAcl: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/macAcls',
    newApi: true
  },
  getSwitchStickyMacAcls: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/stickyMacAcls',
    newApi: true
  }
}
