import { ApiInfo } from '@acx-ui/utils'

import { SwitchUrlsInfo } from './switchUrls'

export const SwitchRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...SwitchUrlsInfo,
  // getAaaSetting: {
  //   method: 'get',
  //   url: '/venues/:venueId/aaaSettings',
  //   oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting',
  //   newApi: true
  // },
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings', //'/venues/:venueId/aaaSettings/:aaaSettingId',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting',
    newApi: true
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/:venueId/aaaServers/query', //'/venues/aaaServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
    newApi: true
  },
  // addAaaServer: {
  //   method: 'post',
  //   url: '/venues/:venueId/aaaServers',
  //   oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
  //   newApi: true
  // },
  // updateAaaServer: {
  //   method: 'put',
  //   url: '/venues/:venueId/aaaServers/:aaaServerId',
  //   oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaServer',
  //   newApi: true
  // },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers/:aaaServerId', //'/venues/aaaServers/:aaaServerId',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/:aaaServerId',
    newApi: true
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers', //'/venues/aaaServers',
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
    url: '/venues/:venueId/switches', //'/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switches',
    newApi: true
  },
  deleteStackMember: {
    method: 'delete',
    url: '/venues/:venueId/stacks/:stackSwitchSerialNumber', //'/stacks/:stackSwitchSerialNumber',
    oldUrl: '/api/switch/tenant/:tenantId/stack/:stackSwitchSerialNumber',
    newApi: true
  },
  acknowledgeSwitch: {
    method: 'put',
    url: '/venues/:venueId/stacks/:switchId/acks', //'/stacks/:switchId/acks',
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
    url: '/venues/:venueId/switches/:switchId', //'/switches/:switchId',
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
    url: '/venues/:venueId/switches/importRequests', //'/venues/switches',
    oldUrl: '/api/switch/tenant/:tenantId/import',
    newApi: true
  },
  getPortSetting: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/portSettings', //'/switches/:switchId/portSettings',
    oldMethod: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:switchId/portId/:portIdentifier',
    newApi: true
  },
  getPortsSetting: {
    method: 'post',
    url: '/venues/:venueId/portSettings', //'/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches/ports',
    newApi: true
  },
  getPorts: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/portSettings', //'switches/:switchId/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/ports',
    newApi: true
  },
  // getVlansByVenue: {
  //   method: 'get',
  //   url: '/venues/:venueId/switchProfiles/vlans',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId',
  //   newApi: true
  // },
  addSwitch: {
    method: 'post',
    url: '/venues/:venueId/switches', //'/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  updateSwitch: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId', //'/switches/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  convertToStack: {
    method: 'post',
    url: '/venues/:venueId/stacks/:switchId', //'/switches/convertToStack',
    oldUrl: '/api/switch/tenant/:tenantId/switch/ConvertToStack',
    newApi: true
  },
  addStackMember: {
    method: 'post',
    url: '/venues/:venueId/stacks/:switchId/members/:memberId', //'/stacks/:stackSerialNumber/members/:newStackMemberSerialNumber',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber',
    newApi: true
  },
  getSwitchConfigBackupList: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups/query', //'/switches/:switchId/configBackups/query',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId/query',
    newApi: true
  },
  addBackup: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups', //'/switches/:switchId/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId',
    newApi: true
  },
  restoreBackup: {
    method: 'patch', //'put',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId', //'/switches/configBackups/:configId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/restore/:configId',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId', //'/switches/configBackupDownloads/:configId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/download/:configId',
    newApi: true
  },
  deleteBackups: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/configBackups', //'/switches/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup',
    newApi: true
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configHistDetails/query', //'/switches/:switchId/configHistDetails/query',
    oldUrl: '/api/switch/tenant/:tenantId/switches/:switchId/configurationHistory/detail/query',
    newApi: true
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vePorts/query', //'/switches/:switchId/vePorts/query',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId/query',
    newApi: true
  },
  // getVenueRoutedList: {
  //   method: 'post',
  //   url: '/venues/:venueId/vePorts/query',
  //   oldUrl: '/api/switch/tenant/:tenantId/vePort/venue/:venueId/query',
  //   newApi: true
  // },
  getDefaultVlan: {
    method: 'post',
    url: '/venues/:venueId/vlans/query', //'/switches/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/defaultVlan/switches',
    newApi: true
  },
  // getSwitchVlanUnionByVenue: {
  //   method: 'get',
  //   url: '/venues/:venueId/vlanUnions',
  //   oldUrl: '/api/switch/tenant/:tenantId/switchVlanUnion/venue/:venueId',
  //   newApi: true
  // },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlanUnions', //'/switches/:switchId/vlanUnions',
    oldUrl: '/api/switch/tenant/:tenantId/vlanUnion/switch/:switchId',
    newApi: true
  },
  getSwitchVlans: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlans', //'/switches/:switchId/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId',
    newApi: true
  },
  addSwitchVlan: {
    method: 'post',
    url: '/venues/:venueId/vlans', //'/switches/:switchId/vlans',
    newApi: true
  },
  addSwitchVlans: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vlans', //'/switches/vlans',
    newApi: true
  },
  deleteSwitchVlans: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans', //'/switches/vlans',
    newApi: true
  },
  // getSwitchesVlan: { // same with getSwitchVlanUnion
  //   method: 'post',
  //   url: '/switches/vlansIntersection/query',
  //   oldUrl: '/api/switch/tenant/:tenantId/vlanIntersection/switches',
  //   newApi: true
  // },
  // getTaggedVlansByVenue: { //deprecated
  //   method: 'post',
  //   url: '/venues/:venueId/taggedVlans/query',
  //   oldMethod: 'get',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/tagged/:port',
  //   newApi: true
  // },
  // getUntaggedVlansByVenue: { //deprecated
  //   method: 'post',
  //   url: '/venues/:venueId/untaggedVlans/query',
  //   oldMethod: 'get',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/vlans/venue/:venueId/model/:model/untagged/:port',
  //   newApi: true
  // },
  // getSwitchConfigurationProfileByVenue: {
  //   method: 'get',
  //   url: '/venues/:venueId/switchProfiles',
  //   oldUrl: '/api/switch/tenant/:tenantId/profiles/venue/:venueId',
  //   newApi: true
  // },
  savePortsSetting: {
    method: 'put',
    url: '/venues/:venueId/portSettings', //'/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches',
    newApi: true
  },
  // getFreeVePortVlans: { // should use getSwitchVlans
  //   method: 'get',
  //   url: '/venues/:venueId/switches/:switchId/vlans',
  //   oldUrl: '/api/switch/tenant/:tenantId/vlanVePort/:venueId/switch/:switchId',
  //   newApi: true
  // },
  getAclUnion: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/aclUnions', //'/switches/:switchId/aclUnions',
    oldUrl: '/api/switch/tenant/:tenantId/aclUnion/switch/:switchId',
    newApi: true
  },
  // addAcl: { // deprecated ??
  //   method: 'post',
  //   url: '/switchProfiles/:profileId/acls',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId/acl',
  //   newApi: true
  // },
  // addVlan: {
  //   method: 'post',
  //   url: '/switchProfiles/:profileId/vlans',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId/vlan',
  //   newApi: true
  // },
  addVePort: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vePorts', //'/switches/:switchId/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId',
    newApi: true
  },
  updateVePort: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vePorts/:vePortId', // '/switches/vePorts/:vePortId',
    oldUrl: '/api/switch/tenant/:tenantId/vePort',
    newApi: true
  },
  deleteVePorts: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vePorts', //'/switches/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePorts',
    newApi: true
  },
  getSwitchAcls: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/acls/query', //'/switches/:switchId/acls/query',
    oldUrl: '/api/switch/tenant/:tenantId/acls/switch/:switchId/query',
    newApi: true
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vlans/query', //'/switches/:switchId/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId/query',
    newApi: true
  },
  getVlanByUuid: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId', // '/switches/vlans/:vlanUuid',
    oldUrl: '/api/switch/tenant/:tenantId/vlan/:vlanUuid',
    newApi: true
  },
  updateVlan: { //new
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    newApi: true
  },
  deleteVlan: { //new
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    newApi: true
  },
  getStaticRoutes: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/staticRoutes', //'/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  addStaticRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/staticRoutes', //'/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  updateStaticRoute: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/staticRoutes/:staticRouteId', // '/switches/staticRoutes/:staticRouteId',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute',
    newApi: true
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/staticRoutes', //'/switches/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoutes',
    newApi: true
  },
  reboot: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/deviceRequests', //'/switches/:switchId/deviceRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/reboot',
    newApi: true
  },
  syncData: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/deviceRequests', //'/switches/:switchId/deviceRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/sync',
    newApi: true
  },
  syncSwitchesData: {
    method: 'post',
    url: '/venues/:venueId/deviceRequests', //'/switches/deviceRequests',
    newApi: true
  },
  retryFirmwareUpdate: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/firmwareUpgrade', //'/switches/:switchId/firmwareUpgrade',
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
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType', //'/switches/:switchId/debugRequests/:troubleshootingType',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingResult' +
      '/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType', //'/switches/:switchId/debugRequests/:troubleshootingType',
    oldMethod: 'get',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType',
    newApi: true
  },
  ping: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests', //'/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/ping',
    newApi: true
  },
  traceRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests', //'/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/trace-route',
    newApi: true
  },
  ipRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests', //'/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/route-table',
    newApi: true
  },
  macAddressTable: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests', //'/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/mac-address-table',
    newApi: true
  },
  getDhcpPools: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/query', //'/switches/:switchId/dhcpServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/query',
    newApi: true
  },
  addDhcpServer: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/dhcpServers', //'/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    newApi: true
  },
  getDhcpServer: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/:dhcpServerId', //'/switches/dhcpServers/:dhcpServerId',
    oldUrl: '/api/switch/tenant/:tenantId/dhcpServer/:dhcpServerId',
    newApi: true
  },
  updateDhcpServer: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/:dhcpServerId', // '/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    newApi: true
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/dhcpServers', //'/switches/:switchId/dhcpServers',
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
    url: '/venues/:venueId/switches/:switchId/debugRequests', //'/switches/:switchId/dhcpServers/leaseTables',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable',
    newApi: true
  },
  updateDhcpServerState: {
    method: 'patch', //'post',
    url: '/venues/:venueId/switches/:switchId/dhcpServerStates', //'/switches/:switchId/dhcpServerStateSettings',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/state',
    newApi: true
  },
  getSwitchProfileList: {
    method: 'post',
    url: '/switches/profiles/query',
    oldUrl: '/api/viewmodel/:tenantId/switch/profilelist',
    newApi: true
  },
  // addSwitchConfigProfile: {
  //   method: 'post',
  //   url: '/switchProfiles',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile',
  //   newApi: true
  // },
  // updateSwitchConfigProfile: {
  //   method: 'put',
  //   url: '/switchProfiles/:profileId',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile',
  //   newApi: true
  // },
  associateSwitchProfile: {
    method: 'put',
    url: '/venues/:venueId/switchProfiles/:switchProfileId',
    newApi: true
  },
  dissociateSwitchProfile: {
    method: 'delete',
    url: '/venues/:venueId/switchProfiles/:switchProfileId',
    newApi: true
  },
  deleteProfile: {
    method: 'delete',
    url: '/switchProfiles/:switchProfileId',
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
  // addCliTemplate: {
  //   method: 'post',
  //   url: '/cliTemplates',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template',
  //   newApi: true
  // },
  // getCliConfigExamples: {
  //   method: 'get',
  //   url: '/cliTemplates/examples',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template/example',
  //   newApi: true
  // },
  // getProfiles: {
  //   method: 'post',
  //   url: '/switchProfiles/query',
  //   oldUrl: '/api/switch/tenant/:tenantId/profiles/query',
  //   newApi: true
  // },
  // getSwitchConfigProfile: {
  //   method: 'get',
  //   url: '/switchProfiles/:profileId',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId',
  //   newApi: true
  // },
  getCliFamilyModels: {
    method: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/cliProfile/familyModels',
    url: '/cliProfiles/familyModels',
    newApi: true
  },
  // deleteProfiles: { // deprecated
  //   method: 'delete',
  //   url: '/switchProfiles',
  //   oldUrl: '/api/switch/tenant/:tenantId/profiles',
  //   newApi: true
  // },
  // getCliTemplates: {
  //   method: 'post',
  //   url: '/cliTemplates/query',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template/query',
  //   newApi: true
  // },
  // deleteCliTemplates: {
  //   method: 'delete',
  //   url: '/cliTemplates',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template',
  //   newApi: true
  // },
  // getCliTemplate: {
  //   method: 'get',
  //   url: '/cliTemplates/:templateId',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template/:templateId',
  //   newApi: true
  // },
  // updateCliTemplate: {
  //   method: 'put',
  //   url: '/cliTemplates/:templateId',
  //   oldUrl: '/api/switch/tenant/:tenantId/cli-template',
  //   newApi: true
  // },
  associateCliTemplate: { //new
    method: 'put',
    url: '/venues/:venueId/cliTemplates/:clitemplateId',
    newApi: true
  },
  getLagList: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/lags', //'/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  updateLag: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/lags/:id', //'/switches/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag',
    newApi: true
  },
  addLag: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/lags', //'/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  deleteLag: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/lags/:id', //'/switches/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag/:lagId',
    newApi: true
  },
  // getSwitchConfigProfileDetail: {
  //   method: 'get',
  //   url: '/switchProfiles/:profileId',
  //   oldUrl: '/api/switch/tenant/:tenantId/profile/:profileId',
  //   newApi: true
  // },
  downloadSwitchsCSV: {
    method: 'post',
    url: '/switches/query/csvFiles',
    oldUrl: '/switches/query/csvFiles',
    newApi: true
  }
}
