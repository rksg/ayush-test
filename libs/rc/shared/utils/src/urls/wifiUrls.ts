import { ApiInfo } from '@acx-ui/utils'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  getVlanPoolViewModelList: {
    method: 'post',
    url: '/enhancedVlanPoolProfiles/query'
  },
  getVlanPools: {
    method: 'get',
    url: '/vlanPools'
  },
  getNetwork: {
    method: 'get',
    url: '/networks/:networkId'
  },
  addNetworkDeep: {
    method: 'post',
    url: '/networks'
  },
  updateNetworkDeep: {
    method: 'put',
    url: '/networks/:networkId'
  },
  deleteNetwork: {
    method: 'delete',
    url: '/networks/:networkId'
  },
  addNetworkVenue: {
    method: 'post',
    url: '/networkActivations'
  },
  addNetworkVenues: {
    method: 'post',
    url: '/networkActivations/mappings'
  },
  updateNetworkVenue: {
    method: 'put',
    url: '/networkActivations/:networkVenueId?quickAck=true'
  },
  updateNetworkVenues: {
    method: 'put',
    url: '/networkActivations/mappings'
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/networkActivations/:networkVenueId'
  },
  deleteNetworkVenues: {
    method: 'delete',
    url: '/networkActivations'
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/venues/:venueId/aps/capabilities'
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/externalAntennaSettings'
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/venues/:venueId/externalAntennaSettings'
  },
  getVenueAntennaType: {
    method: 'get',
    url: '/venues/:venueId/apModelAntennaTypeSettings'
  },
  updateVenueAntennaType: {
    method: 'put',
    url: '/venues/:venueId/apModelAntennaTypeSettings'
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/channels'
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings?defaultOnly=true'
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings'
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/venues/:venueId/radioSettings'
  },
  getVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'get',
    url: '/venues/:venueId/tripleBands'
  },
  updateVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'put',
    url: '/venues/:venueId/tripleBands'
  },
  getAvailableLteBands: {
    method: 'get',
    url: '/venues/lteBands'
  },
  getVenueApModelCellular: {
    method: 'get',
    url: '/venues/:venueId/cellularSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular',
    newApi: true
  },
  updateVenueCellularSettings: {
    method: 'put',
    url: '/venues/:venueId/cellularSettings'
  },
  getAp: {
    method: 'get',
    url: '/venues/aps/:serialNumber?operational=false'
  },
  getApOperational: {
    method: 'get',
    url: '/venues/aps/:serialNumber?operational=true',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber?operational=true',
    newApi: true
  },
  getApValidChannel: {
    method: 'get',
    url: '/venues/aps/:serialNumber/channels'
  },
  getWifiCapabilities: {
    method: 'get',
    url: '/venues/aps/capabilities'
  },
  addAp: {
    method: 'post',
    url: '/venues/aps'
  },
  updateAp: {
    method: 'put',
    url: '/venues/aps/:serialNumber'
  },
  getImportResult: {
    method: 'get',
    url: '/venues/aps/importResults'
  },
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups'
  },
  getApGroupsList: {
    method: 'post',
    url: '/apGroups/query'
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups'
  },
  getApsByApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId/aps'
  },
  getApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId'
  },
  updateApGroup: {
    method: 'put',
    url: '/venues/apGroups/:apGroupId'
  },
  deleteApGroup: {
    method: 'delete',
    url: '/venues/apGroups/:apGroupId'
  },
  deleteApGroups: {
    method: 'delete',
    url: '/venues/apGroups'
  },
  getDhcpAp: {
    method: 'post',
    url: '/venues/dhcpApSettings/query'
  },
  deleteAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber',
    newApi: true
  },
  deleteAps: {
    method: 'delete',
    url: '/venues/aps'
  },
  deleteSoloAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber?resetFirmware=true'
  },
  deleteSoloAps: {
    method: 'delete',
    url: '/venues/aps/?resetFirmware=true'
  },
  downloadApLog: {
    method: 'get',
    url: '/venues/aps/:serialNumber/logs'
  },
  rebootAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber'
  },
  factoryResetAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber'
  },
  getApPhoto: {
    method: 'get',
    url: '/venues/aps/:serialNumber/pictures'
  },
  addApPhoto: {
    method: 'put',
    url: '/venues/aps/:serialNumber/pictures'
  },
  deleteApPhoto: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/pictures'
  },
  getApRadioCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/radioSettings'
  },
  updateApRadioCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/radioSettings'
  },
  deleteApRadioCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/radioSettings'
  },
  pingAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber'
  },
  traceRouteAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber'
  },
  startPacketCapture: {
    method: 'post',
    url: '/venues/aps/:serialNumber/packets'
  },
  stopPacketCapture: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/packets'
  },
  getPacketCaptureState: {
    method: 'get',
    url: '/venues/aps/:serialNumber/packets'
  },
  blinkLedAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber'
  },
  getApCapabilities: {
    method: 'get',
    url: '/venues/aps/:serialNumber/capabilities'
  },
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/dpskPassphrasePools/query'
  },
  getApLanPorts: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lanPortSettings'
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/aps/:serialNumber/lanPortSettings'
  },
  resetApLanPorts: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/lanPortSettings'
  },
  getApLed: {
    method: 'get',
    url: '/venues/aps/:serialNumber/ledSettings'
  },
  updateApLed: {
    method: 'put',
    url: '/venues/aps/:serialNumber/ledSettings'
  },
  resetApLed: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/ledSettings'
  },
  getApBandModeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings'
  },
  updateApBandModeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings'
  },
  resetApBandModeSettings: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/bandModeSettings'
  },
  getApAntennaTypeSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings'
  },
  updateApAntennaTypeSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings'
  },
  resetApAntennaTypeSettings: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/antennaTypeSettings'
  },
  getApBssColoring: {
    method: 'get',
    url: '/venues/aps/:serialNumber/bssColoringSettings'
  },
  updateApBssColoring: {
    method: 'put',
    url: '/venues/aps/:serialNumber/bssColoringSettings'
  },
  getApCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings'
  },
  updateApCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings'
  },
  resetApCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/venues/:venueId/directedMulticastSettings'
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/venues/:venueId/directedMulticastSettings'
  },
  getApDirectedMulticast: {
    method: 'get',
    url: '/venues/aps/:serialNumber/directedMulticastSettings'
  },
  updateApDirectedMulticast: {
    method: 'put',
    url: '/venues/aps/:serialNumber/directedMulticastSettings'
  },
  resetApDirectedMulticast: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/directedMulticastSettings'
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/venues/:venueId/loadBalancingSettings'
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/venues/:venueId/loadBalancingSettings'
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/venues/:venueId/bssColoringSettings'
  },
  updateVenueBssColoring: {
    method: 'put',
    url: '/venues/:venueId/bssColoringSettings'
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/venues/:venueId/clientAdmissionControlSettings'
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/venues/:venueId/clientAdmissionControlSettings'
  },
  getApClientAdmissionControl: {
    method: 'get',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings'
  },
  updateApClientAdmissionControl: {
    method: 'put',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings'
  },
  deleteApClientAdmissionControl: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/clientAdmissionControlSettings'
  },
  getApNetworkSettings: {
    method: 'get',
    url: '/venues/aps/:serialNumber/networkSettings'
  },
  updateApNetworkSettings: {
    method: 'put',
    url: '/venues/aps/:serialNumber/networkSettings'
  },
  resetApNetworkSettings: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/networkSettings'
  },
  getApMeshSettings: {
    method: 'get',
    url: '/venues/aps/:serialNumber/meshSettings'
  },
  updateApMeshSettings: {
    method: 'put',
    url: '/venues/aps/:serialNumber/meshSettings'
  },
  getMeshUplinkAPs: {
    method: 'post',
    url: '/aps/neighbors/query'
  },
  getApRfNeighbors: {
    method: 'get',
    url: '/venues/aps/:serialNumber/rfNeighbors'
  },
  getApLldpNeighbors: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lldpNeighbors'
  },
  detectApNeighbors: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber/neighbors'
  },
  getCcdSupportVenues: {
    method: 'post',
    url: '/venues/clientConnectionDiagnosis/query'
  },
  getCcdSupportApGroups: {
    method: 'post',
    url: '/apGroups/clientConnectionDiagnosis/query?venueId=:venueId'
  },
  runCcd: {
    method: 'post',
    url: '/venues/:venueId/clientConnectionDiagnosis'
  },
  getVenueApManagementVlan: {
    method: 'get',
    url: '/venues/:venueId/aps/managementTrafficVlanSettings'
  },
  updateVenueApManagementVlan: {
    method: 'put',
    url: '/venues/:venueId/aps/managementTrafficVlanSettings'
  },
  getApManagementVlan: {
    method: 'get',
    url: '/venues/aps/:serialNumber/managementTrafficVlanSettings'
  },
  updateApManagementVlan: {
    method: 'put',
    url: '/venues/aps/:serialNumber/managementTrafficVlanSettings',
    newApi: true
  },
  deleteApManagementVlan: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/managementTrafficVlanSettings'
  },
  getApFeatureSets: {
    method: 'get',
    url: '/wifiFeatureSets/:featureName'
  },
  getApCompatibilitiesVenue: {
    method: 'post',
    url: '/venues/:venueId/apCompatibilities/query'
  },
  getApCompatibilitiesNetwork: {
    method: 'post',
    url: '/wifiNetworks/:networkId/apCompatibilities/query'
  }

}
