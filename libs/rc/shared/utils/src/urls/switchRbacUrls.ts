import { ApiInfo } from '@acx-ui/utils'

import { SwitchUrlsInfo } from './switchUrls'

export const SwitchRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...SwitchUrlsInfo,
  updateAaaSetting: {
    method: 'put',
    url: '/venues/:venueId/aaaSettings',
    oldUrl: '/api/switch/tenant/:tenantId/venue/:venueId/aaaSetting',
    newApi: true
  },
  getAaaServerList: {
    method: 'post',
    url: '/venues/:venueId/aaaServers/query',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/query',
    newApi: true
  },
  deleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers/:aaaServerId',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer/:aaaServerId',
    newApi: true
  },
  bulkDeleteAaaServer: {
    method: 'delete',
    url: '/venues/:venueId/aaaServers',
    oldUrl: '/api/switch/tenant/:tenantId/aaaServer',
    newApi: true
  },
  deleteSwitches: {
    method: 'delete',
    url: '/venues/:venueId/switches',
    oldUrl: '/api/switch/tenant/:tenantId/switches',
    newApi: true
  },
  deleteStackMember: {
    method: 'delete',
    url: '/venues/:venueId/stacks/:stackSwitchSerialNumber',
    oldUrl: '/api/switch/tenant/:tenantId/stack/:stackSwitchSerialNumber',
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
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId',
    newApi: true
  },
  importSwitches: {
    method: 'post',
    url: '/venues/:venueId/switches/importRequests',
    oldUrl: '/api/switch/tenant/:tenantId/import',
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
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  updateSwitch: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch',
    newApi: true
  },
  convertToStack: {
    method: 'post',
    url: '/venues/:venueId/stacks/:switchId',
    oldUrl: '/api/switch/tenant/:tenantId/switch/ConvertToStack',
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
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId/query',
    newApi: true
  },
  addBackup: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/switch/:switchId',
    newApi: true
  },
  restoreBackup: {
    method: 'patch',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/restore/:configId',
    newApi: true
  },
  downloadSwitchConfig: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configBackups/:configBackupId',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup/download/:configId',
    newApi: true
  },
  deleteBackups: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/configBackups',
    oldUrl: '/api/switch/tenant/:tenantId/configBackup',
    newApi: true
  },
  getSwitchConfigHistory: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/configHistDetails/query',
    oldUrl: '/api/switch/tenant/:tenantId/switches/:switchId/configurationHistory/detail/query',
    newApi: true
  },
  getSwitchRoutedList: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vePorts/query',
    oldUrl: '/api/switch/tenant/:tenantId/vePort/switch/:switchId/query',
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
  addSwitchVlan: {
    method: 'post',
    url: '/venues/:venueId/vlans',
    newApi: true
  },
  addSwitchVlans: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/vlans',
    newApi: true
  },
  deleteSwitchVlans: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vlans',
    newApi: true
  },
  savePortsSetting: {
    method: 'put',
    url: '/venues/:venueId/switches/portSettings',
    oldUrl: '/api/switch/tenant/:tenantId/port/switches',
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
    newApi: true
  },
  updateVePort: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/vePorts/:vePortId',
    oldUrl: '/api/switch/tenant/:tenantId/vePort',
    newApi: true
  },
  deleteVePorts: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/vePorts',
    oldUrl: '/api/switch/tenant/:tenantId/vePorts',
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
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  addStaticRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute/switch/:switchId',
    newApi: true
  },
  updateStaticRoute: {
    method: 'put',
    url: '/venues/:venueId/switches/:switchId/staticRoutes/:staticRouteId',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoute',
    newApi: true
  },
  deleteStaticRoutes: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/staticRoutes',
    oldUrl: '/api/switch/tenant/:tenantId/staticRoutes',
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
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/sync',
    newApi: true
  },
  syncSwitchesData: {
    method: 'post',
    url: '/venues/:venueId/deviceRequests',
    newApi: true
  },
  retryFirmwareUpdate: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/firmwareUpgrade',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/upgrade',
    newApi: true
  },
  getTroubleshooting: {
    method: 'get',
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingResult' +
      '/:troubleshootingType',
    newApi: true
  },
  getTroubleshootingClean: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/debugRequests/:troubleshootingType',
    oldMethod: 'get',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/troubleshootingClean/:troubleshootingType',
    newApi: true
  },
  ping: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/ping',
    newApi: true
  },
  traceRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/trace-route',
    newApi: true
  },
  ipRoute: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/route-table',
    newApi: true
  },
  macAddressTable: {
    method: 'post',
    url: '/venues/:venueId/switches/:switchId/debugRequests',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/mac-address-table',
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
    newApi: true
  },
  deleteDhcpServers: {
    method: 'delete',
    url: '/venues/:venueId/switches/:switchId/dhcpServers',
    oldUrl: '/api/switch/tenant/:tenantId/switch/:switchId/dhcpServers',
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
    newApi: true
  },
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
  associateCliTemplate: {
    method: 'put',
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
    newApi: true
  },
  getJwtToken: {
    method: 'get',
    url: '/switches/:serialNumber/jwtToken', // TODO: Karen - Need backend support
    newApi: true
  }
}
