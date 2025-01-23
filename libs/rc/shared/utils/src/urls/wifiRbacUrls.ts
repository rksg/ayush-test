import { ApiInfo } from '@acx-ui/utils'

import { WifiUrlsInfo } from './wifiUrls'

export const WifiRbacUrlsInfo: { [key: string]: ApiInfo } = {
  ...WifiUrlsInfo,
  /*
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
  */
  getNetwork: {
    method: 'get',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    newApi: true
  },
  addNetworkDeep: {
    method: 'post',
    //url: '/networks',
    url: '/wifiNetworks',
    opsApi: 'POST:/wifiNetworks',
    newApi: true
  },
  updateNetworkDeep: {
    method: 'put',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    newApi: true
  },
  deleteNetwork: {
    method: 'delete',
    //url: '/networks/:networkId',
    url: '/wifiNetworks/:networkId',
    newApi: true
  },
  getVenueApGroups: {
    method: 'get',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true
  },
  updateVenueApGroups: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/settings',
    newApi: true
  },
  activateVenueApGroup: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVenueApGroup: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getNetworkVenue: {
    method: 'get',
    url: '/venues/:venueId/wifiNetworks/:networkId/settings',
    newApi: true
  },
  getNetworkVenues: {
    method: 'post',
    url: '/venues/wifiNetworks/query',
    newApi: true
  },
  addNetworkVenue: {
    //method: 'post',
    //url: '/networkActivations',
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId',
    newApi: true
  },
  /*
  // no longer supported after v1, use addNetworkVenue loop as replacement
  addNetworkVenues: {
    method: 'post',
    url: '/networkActivations/mappings',
    newApi: true
  },
  */
  updateNetworkVenue: {
    method: 'put',
    //url: '/networkActivations/:networkVenueId?quickAck=true',
    url: '/venues/:venueId/wifiNetworks/:networkId/settings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  /*
  // no longer supported after v1, use updateNetworkVenue loop as replacement
  updateNetworkVenues: {
    method: 'put',
    url: '/networkActivations/mappings',
    newApi: true
  },
  */
  deleteNetworkVenue: {
    method: 'delete',
    //url: '/networkActivations/:networkVenueId',
    url: '/venues/:venueId/wifiNetworks/:networkId',
    newApi: true
  },
  /*
  // no longer supported after v1, use deleteNetworkVenue loop as replacement
  deleteNetworkVenues: {
    method: 'delete',
    url: '/networkActivations',
    newApi: true
  },
  */
  getVenueApCapabilities: {
    method: 'get',
    //url: '/venues/:venueId/aps/capabilities',
    url: '/venues/:venueId/apModelCapabilities',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    // url: '/venues/:venueId/externalAntennaSettings',
    url: '/venues/:venueId/apModelExternalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    // url: '/venues/:venueId/externalAntennaSettings',
    url: '/venues/:venueId/apModelExternalAntennaSettings',
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
    //url: '/venues/:venueId/channels',
    url: '/venues/:venueId/wifiAvailableChannels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    //url: '/venues/:venueId/radioSettings?defaultOnly=true',
    url: '/venues/:venueId/apRadioSettings?defaultOnly=true',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    //url: '/venues/:venueId/radioSettings',
    url: '/venues/:venueId/apRadioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    //url: '/venues/:venueId/radioSettings',
    url: '/venues/:venueId/apRadioSettings',
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
    //url: '/venues/lteBands',
    url: '/venues/apAvailableLteBands',
    newApi: true
  },
  getVenueApModelCellular: {
    method: 'get',
    //url: '/venues/:venueId/cellularSettings',
    url: '/venues/:venueId/apCellularSettings',
    newApi: true
  },
  updateVenueCellularSettings: {
    method: 'put',
    //url: '/venues/:venueId/cellularSettings',
    url: '/venues/:venueId/apCellularSettings',
    newApi: true
  },
  getAp: {
    method: 'get',
    // url: '/venues/aps/:serialNumber?operational=false',
    url: '/venues/:venueId/aps/:serialNumber?operational=false',
    newApi: true
  },
  getApOperational: {
    method: 'get',
    // url: '/venues/aps/:serialNumber?operational=true',
    url: '/venues/:venueId/aps/:serialNumber?operational=true',
    newApi: true
  },
  getApValidChannel: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/channels',
    url: '/venues/:venueId/aps/:serialNumber/wifiAvailableChannels',
    newApi: true
  },
  getWifiCapabilities: {
    method: 'get',
    //url: '/venues/aps/capabilities',
    url: '/venues/apModelCapabilities',
    newApi: true
  },
  addAp: {
    method: 'post',
    // url: '/venues/aps',
    url: '/venues/:venueId/apGroups/:apGroupId/aps',
    opsApi: 'POST:/venues/{id}/apGroups/{id}/aps',
    newApi: true
  },
  addApWithDefaultGroup: {
    method: 'post',
    // url: '/venues/aps',
    url: '/venues/:venueId/aps',
    newApi: true
  },
  moveApToTargetApGroup: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId/aps/:serialNumber',
    newApi: true
  },
  updateAp: {
    method: 'put',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber',
    newApi: true
  },
  getImportResult: {
    method: 'get',
    // url: '/venues/aps/importResults',
    url: '/venues/:venueId/aps/importResults',
    newApi: true
  },
  /*
  // no longer supported after v1, use getApGroupsList as replacement
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },*/
  getApGroupsList: {
    method: 'post',
    // url: '/apGroups/query',
    url: '/venues/apGroups/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  /*
  getApsByApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId/aps',
    newApi: true
  },
  */
  getApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApGroup: {
    method: 'put',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteApGroup: {
    method: 'delete',
    url: '/venues/:venueId/apGroups/:apGroupId',
    // url: '/venues/apGroups/:apGroupId',
    newApi: true
  },
  /*
  // deprecated. loop call the deleteApGroup to replace
  deleteApGroups: {
    method: 'delete',
    url: '/venues/apGroups',
    newApi: true
  },
  */
  // deprecated. use the getDhcpAps to replace
  getDhcpAp: {
    method: 'get',
    // url: '/venues/dhcpApSettings/query',
    url: '/venues/:venueId/aps/:serialNumber/dhcpSettings',
    newApi: true
  },
  getDhcpAps: {
    method: 'post',
    url: '/venues/aps/dhcpSettings/query',
    newApi: true
  },
  deleteAp: {
    method: 'delete',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber',
    newApi: true
  },
  /*
  deleteAps: {
    method: 'delete',
    url: '/venues/aps',
    newApi: true
  },*/
  deleteSoloAp: {
    method: 'delete',
    // url: '/venues/aps/:serialNumber?resetFirmware=true',
    url: '/venues/:venueId/aps/:serialNumber?resetFirmware=true',
    newApi: true
  },
  /*
  deleteSoloAps: {
    method: 'delete',
    url: '/venues/aps/?resetFirmware=true',
    newApi: true
  },*/
  downloadApLog: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/logs',
    url: '/venues/:venueId/aps/:serialNumber/logs',
    newApi: true
  },
  rebootAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/systemCommands',
    newApi: true
  },
  factoryResetAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/systemCommands',
    newApi: true
  },
  getApPhoto: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    newApi: true
  },
  addApPhoto: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    newApi: true
  },
  deleteApPhoto: {
    method: 'delete',
    //url: '/venues/aps/:serialNumber/pictures',
    url: '/venues/:venueId/aps/:serialNumber/pictures',
    newApi: true
  },
  getApRadioCustomization: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/radioSettings',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    newApi: true
  },
  updateApRadioCustomization: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/radioSettings',
    url: '/venues/:venueId/aps/:serialNumber/radioSettings',
    newApi: true
  },
  pingAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    newApi: true
  },
  traceRouteAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    newApi: true
  },
  startPacketCapture: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    newApi: true
  },
  stopPacketCapture: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    newApi: true
  },
  getPacketCaptureState: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/packets',
    url: '/venues/:venueId/aps/:serialNumber/packets',
    newApi: true
  },
  blinkLedAp: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber',
    url: '/venues/:venueId/aps/:serialNumber/diagnosisCommands',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/capabilities',
    url: '/venues/:venueId/aps/:serialNumber/capabilities',
    newApi: true
  },
  /*
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/dpskPassphrasePools/query',
    newApi: true
  },
  */
  getDefaultApLanPorts: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings?defaultOnly=true',
    newApi: true
  },
  getApLanPorts: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  resetApLanPorts: {
    method: 'delete',
    url: '/venues/:venueId/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  getApLed: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/ledSettings',
    url: '/venues/:venueId/aps/:serialNumber/ledSettings',
    newApi: true
  },
  updateApLed: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/ledSettings',
    url: '/venues/:venueId/aps/:serialNumber/ledSettings',
    newApi: true
  },
  getApUsb: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/usbPortSettings',
    newApi: true
  },
  updateApUsb: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/usbPortSettings',
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
    // url: '/venues/aps/:serialNumber/bssColoringSettings',
    url: '/venues/:venueId/aps/:serialNumber/bssColoringSettings',
    newApi: true
  },
  updateApBssColoring: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/bssColoringSettings',
    url: '/venues/:venueId/aps/:serialNumber/bssColoringSettings',
    newApi: true
  },
  getApSmartMonitor: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/smartMonitorSettings',
    newApi: true
  },
  updateApSmartMonitor: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/smartMonitorSettings',
    newApi: true
  },
  getApIot: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/iotSettings',
    newApi: true
  },
  updateApIot: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/iotSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    //url: '/venues/:venueId/directedMulticastSettings',
    url: '/venues/:venueId/apDirectedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    //url: '/venues/:venueId/directedMulticastSettings',
    url: '/venues/:venueId/apDirectedMulticastSettings',
    newApi: true
  },
  getApDirectedMulticast: {
    method: 'get',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  updateApDirectedMulticast: {
    method: 'put',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  /*
  // deprecated. use the updateApDirectedMulticast to replace
  resetApDirectedMulticast: {
    method: 'delete',
    //url: '/venues/aps/:serialNumber/directedMulticastSettings',
    url: '/venues/:venueId/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  */
  getVenueLoadBalancing: {
    method: 'get',
    // url: '/venues/:venueId/loadBalancingSettings',
    url: '/venues/:venueId/apLoadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    // url: '/venues/:venueId/loadBalancingSettings',
    url: '/venues/:venueId/apLoadBalancingSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    // url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    newApi: true
  },
  updateVenueBssColoring: {
    method: 'put',
    // url: '/venues/:venueId/bssColoringSettings',
    url: '/venues/:venueId/apBssColoringSettings',
    newApi: true
  },
  getVenueSmartMonitor: {
    method: 'get',
    url: '/venues/:venueId/apSmartMonitorSettings',
    newApi: true
  },
  updateVenueSmartMonitor: {
    method: 'put',
    url: '/venues/:venueId/apSmartMonitorSettings',
    newApi: true
  },
  getVenueRebootTimeout: {
    method: 'get',
    url: '/venues/:venueId/apRebootTimeoutSettings',
    newApi: true
  },
  updateVenueRebootTimeout: {
    method: 'put',
    url: '/venues/:venueId/apRebootTimeoutSettings',
    newApi: true
  },
  getVenueIot: {
    method: 'get',
    url: '/venues/:venueId/apIotSettings',
    newApi: true
  },
  updateVenueIot: {
    method: 'put',
    url: '/venues/:venueId/apIotSettings',
    newApi: true
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    // url: '/venues/:venueId/clientAdmissionControlSettings',
    url: '/venues/:venueId/apClientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    // url: '/venues/:venueId/clientAdmissionControlSettings',
    url: '/venues/:venueId/apClientAdmissionControlSettings',
    newApi: true
  },
  getApClientAdmissionControl: {
    method: 'get',
    // url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    url: '/venues/:venueId/aps/:serialNumber/clientAdmissionControlSettings',
    newApi: true
  },
  updateApClientAdmissionControl: {
    method: 'put',
    // url: '/venues/aps/:serialNumber/clientAdmissionControlSettings',
    url: '/venues/:venueId/aps/:serialNumber/clientAdmissionControlSettings',
    newApi: true
  },
  getApNetworkSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/networkSettings',
    // url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  updateApNetworkSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/networkSettings',
    // url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  /*
  // deprecated. use the updateApNetworkSettings to replace
  resetApNetworkSettings: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  */
  getApMeshSettings: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/meshSettings',
    // url: '/venues/aps/:serialNumber/meshSettings',
    newApi: true
  },
  updateApMeshSettings: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/meshSettings',
    // url: '/venues/aps/:serialNumber/meshSettings',
    newApi: true
  },
  /*
  // deprecate!! Using the POST /venues/aps/query with the meshStatus.meshNeighbors field to replace
  getMeshUplinkAPs: {
    method: 'post',
    url: '/aps/neighbors/query',
    newApi: true
  },
  */
  getApNeighbors: {
    method: 'post',
    url: '/venues/:venueId/aps/:serialNumber/neighbors/query',
    newApi: true
  },
  /*
  getApRfNeighbors: { deprecate
    method: 'get',
    url: '/venues/aps/:serialNumber/rfNeighbors',
    newApi: true
  },
  getApLldpNeighbors: { deprecate
    method: 'get',
    url: '/venues/aps/:serialNumber/lldpNeighbors',
    newApi: true
  },
  */
  detectApNeighbors: {
    method: 'PATCH',
    // url: '/venues/aps/:serialNumber/neighbors',
    url: '/venues/:venueId/aps/:serialNumber/neighbors',
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
  getVenueApManagementVlan: {
    method: 'get',
    url: '/venues/:venueId/apManagementTrafficVlanSettings',
    newApi: true
  },
  updateVenueApManagementVlan: {
    method: 'put',
    url: '/venues/:venueId/apManagementTrafficVlanSettings',
    newApi: true
  },
  getApManagementVlan: {
    method: 'get',
    url: '/venues/:venueId/aps/:serialNumber/managementTrafficVlanSettings',
    newApi: true
  },
  updateApManagementVlan: {
    method: 'put',
    url: '/venues/:venueId/aps/:serialNumber/managementTrafficVlanSettings',
    newApi: true
  },
  getApFeatureSets: {
    method: 'post',
    url: '/wifiFeatureSets/query',
    //oldMethod: 'get',
    //OldUrl: '/wifiFeatureSets/:featureName',
    newApi: true
  },
  /*
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
  */
  // replace the getApCompatibilitiesVenue
  getVenueApCompatibilities: {
    method: 'post',
    url: '/venues/apCompatibilities/query',
    newApi: true
  },
  getVenuePreCheckApCompatibilities: {
    method: 'post',
    url: '/venues/apCompatibilities/query?precheck=ture',
    newApi: true
  },
  getApCompatibilities: {
    method: 'post',
    url: '/venues/aps/apCompatibilities/query',
    newApi: true
  },
  // replace the getApCompatibilitiesNetwork
  getNetworkApCompatibilities: {
    method: 'post',
    url: '/wifiNetworks/apCompatibilities/query',
    newApi: true
  },
  activateCertificateTemplate: {
    method: 'PUT',
    newApi: true,
    url: '/wifiNetworks/:networkId/certificateTemplates/:certificateTemplateId'
  },
  activateRadiusServer: {
    method: 'put',
    url: '/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateRadiusServer: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/radiusServerProfiles/:radiusId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateRadiusServerSettings: {
    method: 'put',
    url: '/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getRadiusServerSettings: {
    method: 'get',
    url: '/wifiNetworks/:networkId/radiusServerProfileSettings',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateVlanPool: {
    method: 'put',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateVlanPool: {
    method: 'delete',
    url: '/wifiNetworks/:networkId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateApGroupVlanPool: {
    method: 'put',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateApGroupVlanPool: {
    method: 'delete',
    url: '/venues/:venueId/wifiNetworks/:networkId/apGroups/:apGroupId/vlanPoolProfiles/:profileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getApStickyClientSteering: {
    method: 'GET',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApStickyClientSteering: {
    method: 'PUT',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  resetApStickyClientSteering: {
    method: 'DELETE',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/stickyClientSteeringSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateApLanPortSpecificSettings: {
    method: 'PUT',
    newApi: true,
    url: '/venues/:venueId/aps/:serialNumber/lanPortSpecificSettings',
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
