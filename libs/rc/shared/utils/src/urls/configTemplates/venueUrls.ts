import { ApiInfo } from '@acx-ui/utils'

export const VenueConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  addVenueTemplate: {
    method: 'post',
    url: '/templates/venues',
    newApi: true,
    opsApi: 'POST:/templates/venues'
  },
  deleteVenueTemplate: {
    method: 'delete',
    url: '/templates/venues/:templateId',
    newApi: true,
    opsApi: 'DELETE:/templates/venues/{id}'
  },
  updateVenueTemplate: {
    method: 'put',
    url: '/templates/venues/:venueId',
    newApi: true,
    opsApi: 'PUT:/templates/venues/{id}'
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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
    opsApi: 'PUT:/templates/venues/{id}/apRadioSettings',
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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancingRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apLoadBalancingSettings',
    opsApi: 'PUT:/templates/venues/{id}/apLoadBalancingSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  getVenueClientAdmissionControlRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apClientAdmissionControlSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControlRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apClientAdmissionControlSettings',
    opsApi: 'PUT:/templates/venues/{id}/apClientAdmissionControlSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueExternalAntennaRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelExternalAntennaSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntennaRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apModelExternalAntennaSettings',
    opsApi: 'PUT:/template/venues/{id}/apModelExternalAntennaSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiSettings',
    newApi: true
  },
  getVenueMeshRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apMeshSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueMesh: {
    method: 'put',
    url: '/templates/venues/:venueId/meshSettings',
    newApi: true
  },
  updateVenueMeshRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apMeshSettings',
    opsApi: 'PUT:/templates/venues/{id}/apMeshSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDefaultVenueLanPortsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelLanPortSettings?defaultOnly=true',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  getVenueLanPortsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelLanPortSettings',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueLanPorts: {
    method: 'put',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  updateVenueLanPortsRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apModelLanPortSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueLanPortSpecificSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/apModels/:apModel/lanPortSpecificSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getVenueDirectedMulticastRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apDirectedMulticastSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticastRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apDirectedMulticastSettings',
    opsApi: 'PUT:/templates/venues/{id}/apDirectedMulticastSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueRadiusOptions: {
    method: 'get',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  getVenueRadiusOptionsRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apRadiusOptions',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueRadiusOptions: {
    method: 'put',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  updateVenueRadiusOptionsRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apRadiusOptions',
    opsApi: 'PUT:/templates/venues/{id}/apRadiusOptions',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getDenialOfServiceProtection: {
    method: 'get',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  getDenialOfServiceProtectionRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apDosProtectionSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateDenialOfServiceProtection: {
    method: 'put',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  updateDenialOfServiceProtectionRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apDosProtectionSettings',
    opsApi: 'PUT:/templates/venues/{id}/apDosProtectionSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueMdnsFencingPolicy: {
    method: 'get',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  getVenueMdnsFencingPolicyRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apMulticastDnsFencingSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueMdnsFencingPolicy: {
    method: 'put',
    url: '/templates/venues/:venueId/mDnsFencingSettings',
    newApi: true
  },
  updateVenueMdnsFencingPolicyRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apMulticastDnsFencingSettings',
    opsApi: 'PUT:/templates/venues/{id}/apMulticastDnsFencingSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  getVenueBssColoringRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/apBssColoringSettings',
    opsApi: 'GET:/templates/venues/{id}/apBssColoringSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueBssColoring: {
    method: 'put',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  updateVenueBssColoringRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/apBssColoringSettings',
    opsApi: 'PUT:/templates/venues/{id}/apBssColoringSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueDHCPServiceProfile: {
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
  getDhcpUsagesRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiDhcpPoolUsages',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindVenueDhcpProfile: {
    method: 'put',
    url: '/templates/venues/:venueId/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  unbindVenueDhcpProfile: {
    method: 'delete',
    url: '/templates/venues/:venueId/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueDhcpServiceProfileRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/dhcpConfigServiceProfiles/:serviceId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueCityList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/venuetemplate/citylist',
    newApi: true
  },
  getVenueCityListRbac: {
    method: 'post',
    url: '/templates/venues/citylist/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueSwitchSetting: {
    method: 'get',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true
  },
  getVenueSwitchSettingRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateVenueSwitchSetting: {
    method: 'put',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true
  },
  updateVenueSwitchSettingRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/switchSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getVenueSwitchAaaSetting: {
    method: 'get',
    url: '/templates/venues/:venueId/aaaSettings',
    newApi: true
  },
  getVenueSwitchAaaSettingRbac: {
    method: 'get',
    url: '/templates/venues/:venueId/aaaSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateVenueSwitchAaaSetting: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaSettings/:aaaSettingId',
    newApi: true
  },
  updateVenueSwitchAaaSettingRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaSettings/:aaaSettingId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueSwitchAaaServerList: {
    method: 'post',
    url: '/templates/venues/aaaServers/query',
    newApi: true
  },
  getVenueSwitchAaaServerListRbac: {
    method: 'post',
    url: '/templates/venues/aaaServers/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addVenueSwitchAaaServer: {
    method: 'post',
    url: '/templates/venues/:venueId/aaaServers',
    newApi: true
  },
  addVenueSwitchAaaServerRbac: {
    method: 'post',
    url: '/templates/venues/:venueId/aaaServers',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateVenueSwitchAaaServer: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaServers/:aaaServerId',
    newApi: true
  },
  updateVenueSwitchAaaServerRbac: {
    method: 'put',
    url: '/templates/venues/:venueId/aaaServers/:aaaServerId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteVenueSwitchAaaServer: {
    method: 'delete',
    url: '/templates/venues/aaaServers/:aaaServerId',
    newApi: true
  },
  deleteVenueSwitchAaaServerRbac: {
    method: 'delete',
    url: '/templates/venues/aaaServers/:aaaServerId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bulkDeleteVenueSwitchAaaServer: {
    method: 'delete',
    url: '/templates/venues/aaaServers',
    newApi: true
  },
  bulkDeleteVenueSwitchAaaServerRbac: {
    method: 'delete',
    url: '/templates/venues/aaaServers',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
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
  },
  getVenueApModelBandModeSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/apModelBandModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateVenueApModelBandModeSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/apModelBandModeSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getVenueApSmartMonitorSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/apSmartMonitorSettings',
    newApi: true
  },
  updateVenueApSmartMonitorSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/apSmartMonitorSettings',
    opsApi: 'PUT:/templates/venues/{id}/apSmartMonitorSettings',
    newApi: true
  },
  getVenueApRebootTimeoutSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/apRebootTimeoutSettings',
    newApi: true
  },
  updateVenueApRebootTimeoutSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/apRebootTimeoutSettings',
    opsApi: 'PUT:/templates/venues/{id}/apRebootTimeoutSettings',
    newApi: true
  },
  getVenueApIotSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/apIotSettings',
    newApi: true
  },
  updateVenueApIotSettings: {
    method: 'put',
    url: '/templates/venues/:venueId/apIotSettings',
    opsApi: 'PUT:/templates/venues/{id}/apIotSettings',
    newApi: true
  }
}
