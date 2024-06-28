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
  getVenueApCapabilities: {
    method: 'get',
    url: '/templates/venues/:venueId/aps/capabilities',
    newApi: true
  },
  getVenueApCapabilitiesRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelCapabilities',
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
  getVenueDefaultRegulatoryChannelsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiAvailableChannels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings?defaultOnly=true',
    newApi: true
  },
  getDefaultRadioCustomizationRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apRadioSettings?defaultOnly=true',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  getVenueRadioCustomizationRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apRadioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  updateVenueRadioCustomizationRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apRadioSettings',
    newApi: true
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  getVenueLoadBalancingRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apLoadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancingRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apLoadBalancingSettings',
    newApi: true
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  getVenueClientAdmissionControlRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apClientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControlRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apClientAdmissionControlSettings',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueExternalAntennaRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelExternalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntennaRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apModelExternalAntennaSettings',
    newApi: true
  },
  getVenueSettings: { // TODO
    method: 'get',
    url: '/templates/venues/:venueId/wifiSettings',
    newApi: true
  },
  updateVenueMesh: {
    method: 'put',
    url: '/templates/venues/:venueId/meshSettings',
    newApi: true
  },
  updateVenueMeshRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apMeshSettings',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  getVenueLanPortsRbac: { // TODO
    method: 'get',
    url: '/templates/venues/:venueId/apModelLanPortSettings',
    newApi: true
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  updateVenueLanPortsRbac: { // TODO
    method: 'put',
    url: '/templates/venues/:venueId/apModelLanPortSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getVenueDirectedMulticastRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apDirectedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticastRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apDirectedMulticastSettings',
    newApi: true
  },
  getVenueRadiusOptions: {
    method: 'get',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  getVenueRadiusOptionsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apRadiusOptions',
    newApi: true
  },
  updateVenueRadiusOptions: {
    method: 'put',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  updateVenueRadiusOptionsRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apRadiusOptions',
    newApi: true
  },
  getDenialOfServiceProtection: {
    method: 'get',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  getDenialOfServiceProtectionRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apDosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtectionRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apDosProtectionSettings',
    newApi: true
  },
  getVenueMdnsFencingPolicy: {
    method: 'get',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  getVenueMdnsFencingPolicyRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apMulticastDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicyRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apMulticastDnsFencingSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  getVenueBssColoringRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apBssColoringSettings',
    newApi: true
  },
  updateVenueBssColoring: {
    method: 'put',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  updateVenueBssColoringRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apBssColoringSettings',
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
  getVenueCityList: { // TODO
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
  },
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/templates/venues/:venueId/apGroups',
    newApi: true
  },
  getApGroupNetworkList: {
    method: 'post',
    url: '/templates/apGroups/:apGroupId/networks/query',
    newApi: true
  },
  networkActivations: {
    method: 'post',
    url: '/templates/networkActivations/query',
    newApi: true
  }
}
