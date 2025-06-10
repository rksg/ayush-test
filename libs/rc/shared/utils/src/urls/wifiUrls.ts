import { ApiInfo } from '@acx-ui/utils'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  getVlanPoolViewModelList: {
    method: 'post',
    url: '/enhancedVlanPoolProfiles/query',
    newApi: true
  },
  getVlanPools: {
    method: 'get',
    url: '/vlanPools',
    newApi: true
  },
  getNetwork: {
    method: 'get',
    url: '/networks/:networkId',
    newApi: true
  },
  addNetworkDeep: {
    method: 'post',
    url: '/networks',
    newApi: true
  },
  updateNetworkDeep: {
    method: 'put',
    url: '/networks/:networkId',
    newApi: true
  },
  deleteNetwork: {
    method: 'delete',
    url: '/networks/:networkId',
    newApi: true
  },
  addNetworkVenue: {
    method: 'post',
    url: '/networkActivations',
    newApi: true
  },
  addNetworkVenues: {
    method: 'post',
    url: '/networkActivations/mappings',
    newApi: true
  },
  updateNetworkVenue: {
    method: 'put',
    url: '/networkActivations/:networkVenueId?quickAck=true',
    newApi: true
  },
  updateNetworkVenues: {
    method: 'put',
    url: '/networkActivations/mappings',
    newApi: true
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/networkActivations/:networkVenueId',
    newApi: true
  },
  deleteNetworkVenues: {
    method: 'delete',
    url: '/networkActivations',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/venues/:venueId/aps/capabilities',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueAntennaType: {
    method: 'get',
    url: '/venues/:venueId/apModelAntennaTypeSettings',
    newApi: true
  },
  updateVenueAntennaType: {
    method: 'put',
    url: '/venues/:venueId/apModelAntennaTypeSettings',
    newApi: true
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/channels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings?defaultOnly=true',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/venues/:venueId/radioSettings',
    newApi: true
  },
  getVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'get',
    url: '/venues/:venueId/tripleBands',
    newApi: true
  },
  updateVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'put',
    url: '/venues/:venueId/tripleBands',
    newApi: true
  },
  getAvailableLteBands: {
    method: 'get',
    url: '/venues/lteBands',
    newApi: true
  },
  getVenueApModelCellular: {
    method: 'get',
    url: '/venues/:venueId/cellularSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular',
    newApi: true
  },
  updateVenueCellularSettings: {
    method: 'put',
    url: '/venues/:venueId/cellularSettings',
    newApi: true
  },
  getAp: {
    method: 'get',
    url: '/venues/aps/:serialNumber?operational=false',
    newApi: true
  },
  getApOperational: {
    method: 'get',
    url: '/venues/aps/:serialNumber?operational=true',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber?operational=true',
    newApi: true
  },
  getApValidChannel: {
    method: 'get',
    url: '/venues/aps/:serialNumber/channels',
    newApi: true
  },
  getWifiCapabilities: {
    method: 'get',
    url: '/venues/aps/capabilities',
    newApi: true
  },
  addAp: {
    method: 'post',
    url: '/venues/aps',
    newApi: true
  },
  updateAp: {
    method: 'put',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  getImportResult: {
    method: 'get',
    url: '/venues/aps/importResults',
    newApi: true
  },
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },
  getApGroupsList: {
    method: 'post',
    url: '/apGroups/query',
    newApi: true
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },
  getApsByApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId/aps',
    newApi: true
  },
  getApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId',
    newApi: true
  },
  updateApGroup: {
    method: 'put',
    url: '/venues/apGroups/:apGroupId',
    newApi: true
  },
  deleteApGroup: {
    method: 'delete',
    url: '/venues/apGroups/:apGroupId',
    newApi: true
  },
  deleteApGroups: {
    method: 'delete',
    url: '/venues/apGroups',
    newApi: true
  },
  getDhcpAp: {
    method: 'post',
    url: '/venues/dhcpApSettings/query',
    newApi: true
  },
  deleteAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber',
    newApi: true
  },
  deleteAps: {
    method: 'delete',
    url: '/venues/aps',
    newApi: true
  },
  deleteSoloAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber?resetFirmware=true',
    newApi: true
  },
  deleteSoloAps: {
    method: 'delete',
    url: '/venues/aps/?resetFirmware=true',
    newApi: true
  },
  downloadApLog: {
    method: 'get',
    url: '/venues/aps/:serialNumber/logs',
    newApi: true
  },
  rebootAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  factoryResetAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  getApPhoto: {
    method: 'get',
    url: '/venues/aps/:serialNumber/pictures',
    newApi: true
  },
  addApPhoto: {
    method: 'put',
    url: '/venues/aps/:serialNumber/pictures',
    newApi: true
  },
  deleteApPhoto: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/pictures',
    newApi: true
  },
  getApRadioCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/radioSettings',
    newApi: true
  },
  updateApRadioCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/radioSettings',
    newApi: true
  },
  pingAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  traceRouteAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  startPacketCapture: {
    method: 'post',
    url: '/venues/aps/:serialNumber/packets',
    newApi: true
  },
  stopPacketCapture: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/packets',
    newApi: true
  },
  getPacketCaptureState: {
    method: 'get',
    url: '/venues/aps/:serialNumber/packets',
    newApi: true
  },
  blinkLedAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    url: '/venues/aps/:serialNumber/capabilities',
    newApi: true
  },
  getApLanPorts: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  resetApLanPorts: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  getApLed: {
    method: 'get',
    url: '/venues/aps/:serialNumber/ledSettings',
    newApi: true
  },
  updateApLed: {
    method: 'put',
    url: '/venues/aps/:serialNumber/ledSettings',
    newApi: true
  },
  resetApLed: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/ledSettings',
    newApi: true
  },
  getApBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true
  },
  updateApBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings',
    newApi: true
  },
  getApGroupBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId/apModelBandModeSettings',
    newApi: true
  },
  updateApGroupBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId/apModelBandModeSettings',
    newApi: true
  },
  getApAntennaTypeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings',
    newApi: true
  },
  updateApAntennaTypeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings',
    newApi: true
  },
  getApBssColoring: {
    method: 'get',
    url: '/venues/aps/:serialNumber/bssColoringSettings',
    newApi: true
  },
  updateApBssColoring: {
    method: 'put',
    url: '/venues/aps/:serialNumber/bssColoringSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getApDirectedMulticast: {
    method: 'get',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  updateApDirectedMulticast: {
    method: 'put',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  resetApDirectedMulticast: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  updateVenueBssColoring: {
    method: 'put',
    url: '/venues/:venueId/bssColoringSettings',
    newApi: true
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  getApClientAdmissionControl: {
    method: 'get',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    newApi: true
  },
  updateApClientAdmissionControl: {
    method: 'put',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    newApi: true
  },
  deleteApClientAdmissionControl: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    newApi: true
  },
  getApNetworkSettings: {
    method: 'get',
    url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  updateApNetworkSettings: {
    method: 'put',
    url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  resetApNetworkSettings: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  getApMeshSettings: {
    method: 'get',
    url: '/venues/aps/:serialNumber/meshSettings',
    newApi: true
  },
  updateApMeshSettings: {
    method: 'put',
    url: '/venues/aps/:serialNumber/meshSettings',
    newApi: true
  },
  getMeshUplinkAPs: {
    method: 'post',
    url: '/aps/neighbors/query',
    newApi: true
  },
  getApRfNeighbors: {
    method: 'get',
    url: '/venues/aps/:serialNumber/rfNeighbors',
    newApi: true
  },
  getApLldpNeighbors: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lldpNeighbors',
    newApi: true
  },
  detectApNeighbors: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber/neighbors',
    newApi: true
  },
  getCcdSupportVenues: {
    method: 'post',
    url: '/venues/clientConnectionDiagnosis/query',
    newApi: true
  },
  getCcdSupportApGroups: {
    method: 'post',
    url: '/apGroups/clientConnectionDiagnosis/query?venueId=:venueId',
    newApi: true
  },
  runCcd: {
    method: 'post',
    url: '/venues/:venueId/clientConnectionDiagnosis',
    newApi: true
  },
  getApFeatureSets: {
    method: 'get',
    url: '/wifiFeatureSets/:featureName',
    newApi: true
  },
  getApCompatibilitiesVenue: {
    method: 'post',
    url: '/venues/:venueId/apCompatibilities/query',
    newApi: true
  },
  getApCompatibilitiesNetwork: {
    method: 'post',
    url: '/wifiNetworks/:networkId/apCompatibilities/query',
    newApi: true
  },
  activateCertificateTemplate: {
    method: 'PUT',
    newApi: true,
    url: '/wifiNetworks/:networkId/certificateTemplates/:certificateTemplateId',
    opsApi: 'PUT:/wifiNetworks/{id}/certificateTemplates/{id}'
  },
  deactivateCertificateTemplate: {
    method: 'DELETE',
    newApi: true,
    url: '/wifiNetworks/:networkId/certificateTemplates/:certificateTemplateId',
    opsApi: 'DELETE:/wifiNetworks/{id}/certificateTemplates/{id}',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  bindClientIsolation: {
    method: 'PUT',
    newApi: true,
    url: '/venues/:venueId/wifiNetworks/:networkId/clientIsolationProfiles/:policyId',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  unbindClientIsolation: {
    method: 'delete',
    newApi: true,
    url: '/venues/:venueId/wifiNetworks/:networkId/clientIsolationProfiles/:policyId',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateVlanPool: {
    method: 'put',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true
  },
  deactivateVlanPool: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true
  },
  activateApGroupVlanPool: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true
  },
  deactivateApGroupVlanPool: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true
  },
  activateDpskService: {
    method: 'PUT',
    newApi: true,
    url: '/wifiNetworks/:networkId/dpskServices/:dpskServiceId',
    opsApi: 'PUT:/wifiNetworks/{id}/dpskServices/{id}',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateMacRegistrationPool: {
    method: 'PUT',
    newApi: true,
    url: '/wifiNetworks/:networkId/macRegistrationPools/:macRegistrationPoolId',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  queryDpskService: {
    method: 'GET',
    newApi: true,
    url: '/wifiNetworks/:networkId/dpskServices',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  queryCertificateTemplate: {
    method: 'GET',
    newApi: true,
    url: '/wifiNetworks/:networkId/certificateTemplates',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  queryMacRegistrationPool: {
    method: 'GET',
    newApi: true,
    url: '/wifiNetworks/:networkId/macRegistrationPools',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
