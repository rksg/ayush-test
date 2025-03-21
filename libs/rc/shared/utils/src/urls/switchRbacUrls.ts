import { ApiInfo } from '@acx-ui/utils'

import { SwitchUrlsInfo } from './switchUrls'

export const SwitchRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...SwitchUrlsInfo,
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings',
    newApi: true
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/:venueId/aaaServers/query',
    newApi: true
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers/:aaaServerId',
    opsApi: 'DELETE:/venues/{id}/aaaServers/{id}',
    newApi: true
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers',
    newApi: true
  },
  deleteSwitches: {
    method: 'delete',
    url: '/venues/:venueId/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switches',
    opsApi: 'DELETE:/venues/{id}/switches',
    newApi: true
  },
  deleteStackMember: {
    method: 'delete',
    url: '/venues/:venueId/stacks/:stackSwitchSerialNumber',
    oldUrl: '/api/switch/tenant/:tenantId/stack/:stackSwitchSerialNumber',
    opsApi: 'DELETE:/venues/{id}/stacks/{id}',
    newApi: true
  },
  acknowledgeSwitch: {
    method: 'put',
    url: '/venues/:venueId/stacks/:switchId/acks',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/ack',
    newApi: true
  },
  getSwitch: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId',
    newApi: true
  },
  importSwitches: {
    method: 'post',
    url: '/venues/:venueId/switches/importRequests',
    oldUrl: '/api/switch/tenant/:tenantId/import',
    opsApi: 'POST:/venues/{id}/switches/importRequests',
    newApi: true
  },
  getPortSetting: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/portSettings',
    oldMethod: 'get',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:switchId/portId/:portIdentifier',
    newApi: true
  },
  getPortsSetting: {
    method: 'post',
    url: '/venues/:venueId/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches/ports',
    newApi: true
  },
  getPorts: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switch/:serialNumber/ports',
    newApi: true
  },
  addSwitch: {
    method: 'post',
    url: '/venues/:venueId/switches',
    opsApi: 'POST:/venues/{id}/switches',
    newApi: true
  },
  updateSwitch: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId',
    opsApi: 'PUT:/venues/{id}/switches/{id}',
    newApi: true
  },
  convertToStack: {
    method: 'post',
    url: '/venues/:venueId/stacks/:switchId',
    newApi: true
  },
  addStackMember: {
    method: 'post',
    url: '/venues/:venueId/stacks/:switchId/members/:memberId',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:stackSerialNumber/member/:newStackMemberSerialNumber',
    newApi: true
  },
  getSwitchConfigBackupList: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups/query',
    newApi: true
  },
  addBackup: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups',
    opsApi: 'POST:/venues/{id}/switches/{id}/configBackups',
    newApi: true
  },
  restoreBackup: {
    method: 'PATCH',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId',
    opsApi: 'PATCH:/venues/{id}/switches/{id}/configBackups/{id}',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/download/:configId',
    opsApi: 'POST:/venues/{id}/switches/{id}/configBackups/{id}',
    newApi: true
  },
  deleteBackups: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/configBackups',
    newApi: true
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configHistDetails/query',
    newApi: true
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vePorts/query',
    newApi: true
  },
  getDefaultVlan: {
    method: 'post',
    url: '/venues/:venueId/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/defaultVlan/switches',
    newApi: true
  },
  getSwitchVlanUnion: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlanUnions',
    oldUrl: '/api/switch/tenant/:tenantId/vlanUnion/switch/:switchId',
    newApi: true
  },
  getSwitchVlans: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlans',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId',
    newApi: true
  },
  deleteSwitchVlan: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/vlans/{id}',
    newApi: true
  },
  updateSwitchVlan: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    opsApi: 'PUT:/venues/{id}/switches/{id}/vlans/{id}',
    newApi: true
  },
  addSwitchVlans: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vlans',
    opsApi: 'POST:/venues/{id}/switches/{id}/vlans',
    newApi: true
  },
  addSwitchesVlans: {
    method: 'post',
    url: '/venues/:venueId/vlans',
    newApi: true
  },
  deleteSwitchVlans: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/vlans',
    newApi: true
  },
  savePortsSetting: {
    method: 'put',
    url: '/venues/:venueId/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches',
    opsApi: 'PUT:/venues/{id}/switches/portSettings',
    newApi: true
  },
  getAclUnion: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/aclUnions',
    oldUrl: '/api/switch/tenant/:tenantId/aclUnion/switch/:switchId',
    newApi: true
  },
  addVePort: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId',
    opsApi: 'POST:/venues/{id}/switches/{id}/vePorts',
    newApi: true
  },
  updateVePort: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vePorts/:vePortId',
    oldUrl: '/api/switch/tenant/:tenantId/vePort',
    opsApi: 'PUT:/venues/{id}/switches/{id}/vePorts/{id}',
    newApi: true
  },
  deleteVePorts: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vePorts',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/vePorts',
    newApi: true
  },
  getSwitchAcls: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/acls/query',
    oldUrl: '/api/switch/tenant/:tenantId/acls/switch/:switchId/query',
    newApi: true
  },
  getVlanListBySwitchLevel: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vlans/query',
    oldUrl: '/api/switch/tenant/:tenantId/vlans/switch/:switchId/query',
    newApi: true
  },
  getVlanByUuid: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    oldUrl: '/api/switch/tenant/:tenantId/vlan/:vlanUuid',
    newApi: true
  },
  updateVlan: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    newApi: true
  },
  deleteVlan: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans/:vlanId',
    newApi: true
  },
  getStaticRoutes: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/staticRoutes',
    newApi: true
  },
  addStaticRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/staticRoutes',
    opsApi: 'POST:/venues/{id}/switches/{id}/staticRoutes',
    newApi: true
  },
  updateStaticRoute: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/staticRoutes/:staticRouteId',
    newApi: true
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/staticRoutes',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/staticRoutes',
    newApi: true
  },
  reboot: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/deviceRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/reboot',
    newApi: true
  },
  syncData: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/deviceRequests',
    newApi: true
  },
  syncSwitchesData: {
    method: 'post',
    url: '/venues/:venueId/deviceRequests',
    opsApi: 'POST:/venues/{id}/deviceRequests',
    newApi: true
  },
  retryFirmwareUpdate: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/firmwareUpgrade',
    opsApi: 'POST:/venues/{id}/switches/{id}/firmwareUpgrade',
    newApi: true
  },
  getTroubleshooting: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType',
    newApi: true
  },
  ping: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    newApi: true
  },
  traceRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    newApi: true
  },
  ipRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    newApi: true
  },
  cableTest: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    newApi: true
  },
  macAddressTable: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    newApi: true
  },
  getDhcpPools: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/query',
    newApi: true
  },
  addDhcpServer: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    opsApi: 'POST:/venues/{id}/switches/{id}/dhcpServers',
    newApi: true
  },
  getDhcpServer: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/:dhcpServerId',
    oldUrl: '/api/switch/tenant/:tenantId/dhcpServer/:dhcpServerId',
    newApi: true
  },
  updateDhcpServer: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/dhcpServers/:dhcpServerId',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer',
    opsApi: 'PUT:/venues/{id}/switches/{id}/dhcpServers/{id}',
    newApi: true
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServers',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/dhcpServers',
    newApi: true
  },
  getDhcpLeases: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/debugRequests/dhcp-server-lease-table',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/'+
      'troubleshootingResult/dhcp-server-lease-table',
    newApi: true
  },
  dhcpLeaseTable: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/leaseTable',
    newApi: true
  },
  updateDhcpServerState: {
    method: 'PATCH',
    url: '/venues/:venueId/switches/:switchId/dhcpServerStates',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServer/state',
    opsApi: 'PATCH:/venues/{id}/switches/{id}/dhcpServerStates',
    newApi: true
  },
  associateSwitchProfile: {
    method: 'put',
    url: '/venues/:venueId/switchProfiles/:profileId',
    newApi: true
  },
  disassociateSwitchProfile: {
    method: 'delete',
    url: '/venues/:venueId/switchProfiles/:profileId',
    newApi: true
  },
  getCliFamilyModels: {
    method: 'get',
    url: '/cliProfiles/venues',
    newApi: true
  },
  deleteSwitchProfile: {
    method: 'delete',
    url: '/switchProfiles/:switchProfileId',
    newApi: true
  },
  associateCliTemplate: {
    method: 'put',
    url: '/venues/:venueId/cliTemplates/:templateId',
    newApi: true
  },
  disassociateCliTemplate: {
    method: 'delete',
    url: '/venues/:venueId/cliTemplates/:templateId',
    newApi: true
  },
  getLagList: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  updateLag: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag',
    opsApi: 'PUT:/venues/{id}/switches/{id}/lags/{id}',
    newApi: true
  },
  addLag: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/lags',
    oldUrl: '/api/switch/tenant/:tenantId/lag/switch/:switchId',
    newApi: true
  },
  deleteLag: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/lags/:lagId',
    oldUrl: '/api/switch/tenant/:tenantId/lag/:lagId',
    opsApi: 'DELETE:/venues/{id}/switches/{id}/lags/{id}',
    newApi: true
  },
  getJwtToken: {
    method: 'get',
    url: '/venues/:venueId/switches/:serialNumber/jwtToken',
    newApi: true
  },
  getSwitchDetailHeader: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/configurations',
    newApi: true
  },
  getSwitchList: {
    method: 'post',
    url: '/venues/switches/query',
    newApi: true
  },
  getSwitchClientList: {
    method: 'post',
    url: '/venues/switches/clients/query',
    newApi: true
  },
  getSwitchClientDetail: {
    method: 'post',
    url: '/venues/switches/clients/query',
    newApi: true
  },
  getSwitchListByGroup: {
    method: 'post',
    url: '/venues/switches/aggregationDetails',
    newApi: true
  },
  getSwitchModelList: {
    method: 'post',
    url: '/venues/switches/models/query',
    newApi: true
  },
  downloadSwitchsCSV: {
    method: 'post',
    url: '/venues/switches/query/csvFiles',
    newApi: true
  },
  getSwitchPortlist: {
    method: 'post',
    url: '/venues/switches/switchPorts/query',
    newApi: true
  },
  getMemberList: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/members',
    newApi: true
  },
  getSwitchRearView: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/rearDetails?unitid=:unitId',
    newApi: true
  },
  getAccessControls: {
    method: 'post',
    url: '/switchL2AclPolicies/query',
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
    url: '/venues/:venueId/switches/:switchId/switchL2Acls/query',
    newApi: true
  },
  addSwitchMacAcl: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/switchL2Acls',
    newApi: true
  },
  updateSwitchMacAcl: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/switchL2Acls/:macAclId',
    newApi: true
  },
  deleteSwitchMacAcl: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/switchL2Acls',
    newApi: true
  },
  getSwitchStickyMacAcls: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/stickyMacAcls',
    newApi: true
  }
}
