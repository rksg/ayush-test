import { ApiInfo } from '@acx-ui/utils'

export const VenueConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  addVenueTemplate: {
    method: 'post',
    url: '/templates/venues',
    newApi: true
  },
  deleteVenueTemplate: {
    method: 'delete',
    url: '/templates/venues/:templateId',
    newApi: true
  },
  updateVenueTemplate: {
    method: 'put',
    url: '/templates/venues/:venueId',
    newApi: true
  },
  getVenueTemplate: {
    method: 'get',
    url: '/templates/venues/:venueId',
    newApi: true
  },
  getVenuesTemplateList: {
    method: 'post',
    url: '/templates/venues/query',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/templates/venues/:venueId/aps/capabilities',
    newApi: true
  },
  getVenueTripleBandRadioSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/tripleBands',
    newApi: true
  },
  updateVenueTripleBandRadioSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/tripleBands',
    newApi: true
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/templates/venues/:venueId/channels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings?defaultOnly=true',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiSettings',
    newApi: true
  },
  updateVenueMesh: {
    method: 'put',
    url: '/templates/venues/:venueId/meshSettings',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getVenueRadiusOptions: {
    method: 'get',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  updateVenueRadiusOptions: {
    method: 'put',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  getDenialOfServiceProtection: {
    method: 'get',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  getVenueMdnsFencingPolicy: {
    method: 'get',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  updateVenueBssColoring: {
    method: 'put',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  getVenueDhcpProfile: {
    method: 'get',
    url: '/templates/venues/:venueId/dhcpConfigServiceProfileSettings',
    newApi: true
  },
  updateVenueDhcpProfile: {
    method: 'post',
    url: '/templates/venues/:venueId/dhcpConfigServiceProfileSettings',
    newApi: true
  },
  getVenueDhcpActivePools: {
    method: 'get',
    url: '/templates/venues/:venueId/dhcpPools',
    newApi: true
  },
  activateVenueDhcpPool: {
    method: 'post',
    url: '/templates/venues/:venueId/dhcpPools/:dhcppoolId',
    newApi: true
  },
  deactivateVenueDhcpPool: {
    method: 'delete',
    url: '/templates/venues/:venueId/dhcpPools/:dhcppoolId',
    newApi: true
  },
  getVenueCityList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/venuetemplate/citylist',
    newApi: true
  },
  getVenueSwitchSetting: {
    method: 'get',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true
  },
  getVenueSwitchAaaSetting: {
    method: 'get',
    url: '/templates/venues/:venueId/aaaSettings',
    newApi: true
  },
  updateVenueSwitchAaaSetting: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaSettings/:aaaSettingId',
    newApi: true
  },
  getVenueSwitchAaaServerList: {
    method: 'post',
    url: '/templates/venues/aaaServers/query',
    newApi: true
  },
  addVenueSwitchAaaServer: {
    method: 'post',
    url: '/templates/venues/:venueId/aaaServers',
    newApi: true
  },
  updateVenueSwitchAaaServer: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaServers/:aaaServerId',
    newApi: true
  },
  deleteVenueSwitchAaaServer: {
    method: 'delete',
    url: '/templates/venues/aaaServers/:aaaServerId',
    newApi: true
  },
  bulkDeleteVenueSwitchAaaServer: {
    method: 'delete',
    url: '/templates/venues/aaaServers',
    newApi: true
  }
}
