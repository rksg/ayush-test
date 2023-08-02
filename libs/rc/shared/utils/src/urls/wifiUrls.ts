import { ApiInfo } from '@acx-ui/utils'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  GetDefaultDhcpServiceProfileForGuestNetwork: {
    // used in testcase
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcp-service-profile/guest-network-default'
  },
  getVlanPoolViewModelList: {
    method: 'post',
    url: '/enhancedVlanPoolProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedVlanPoolProfiles/query',
    newApi: true
  },
  getVlanPools: {
    method: 'get',
    url: '/vlanPools',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool',
    newApi: true
  },
  getNetwork: {
    method: 'get',
    url: '/networks/:networkId',
    oldUrl: '/api/tenant/:tenantId/wifi/network/:networkId/deep',
    newApi: true
  },
  addNetworkDeep: {
    method: 'post',
    url: '/networks',
    oldUrl: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true',
    newApi: true
  },
  updateNetworkDeep: {
    method: 'put',
    url: '/networks/:networkId',
    oldUrl: '/api/tenant/:tenantId/wifi/network/:networkId/deep?quickAck=true',
    newApi: true
  },
  deleteNetwork: {
    method: 'delete',
    url: '/networks/:networkId',
    oldUrl: '/api/tenant/:tenantId/wifi/network/:networkId',
    newApi: true
  },
  addNetworkVenue: {
    method: 'post',
    url: '/networkActivations',
    oldUrl: '/api/tenant/:tenantId/wifi/network-venue',
    newApi: true
  },
  addNetworkVenues: {
    method: 'post',
    url: '/networkActivations/mappings',
    oldUrl: '/api/tenant/:tenantId/wifi/network-venue',
    newApi: true
  },
  updateNetworkVenue: {
    method: 'put',
    url: '/networkActivations/:networkVenueId?quickAck=true',
    oldUrl: '/api/tenant/:tenantId/wifi/network-venue/:networkVenueId?quickAck=true',
    newApi: true
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/networkActivations/:networkVenueId',
    oldUrl: '/api/tenant/:tenantId/wifi/network-venue/:networkVenueId',
    newApi: true
  },
  deleteNetworkVenues: {
    method: 'delete',
    url: '/networkActivations',
    oldUrl: '/api/tenant/:tenantId/wifi/network-venue',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/externalAntennaSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/venues/:venueId/aps/capabilities',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/venues/:venueId/externalAntennaSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna',
    newApi: true
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/channels',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/valid-channels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/radio/default',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/radio',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/venues/:venueId/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/radio',
    newApi: true
  },
  getVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'get',
    url: '/venues/:venueId/tripleBands',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band',
    newApi: true
  },
  updateVenueTripleBandRadioSettings: {
    // [New API] private api
    method: 'put',
    url: '/venues/:venueId/tripleBands',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band',
    newApi: true
  },
  getAvailableLteBands: {
    method: 'get',
    url: '/venues/lteBands',
    oldUrl: '/api/tenant/:tenantId/wifi/lte-band',
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
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular',
    newApi: true
  },
  getAp: {
    method: 'get',
    url: '/venues/aps/:serialNumber?operational=false',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber?operational=false',
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
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/valid-channel',
    newApi: true
  },
  getWifiCapabilities: {
    method: 'get',
    url: '/venues/aps/capabilities',
    oldUrl: '/api/tenant/:tenantId/wifi/capabilities',
    newApi: true
  },
  addAp: {
    method: 'post',
    url: '/venues/aps',
    oldUrl: '/api/tenant/:tenantId/wifi/ap',
    newApi: true
  },
  updateAp: {
    method: 'put',
    url: '/venues/aps/:serialNumber',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber',
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
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/default-ap-group',
    newApi: true
  },
  getApGroupsList: {
    method: 'post',
    url: '/apGroups/query',
    oldUrl: '/api/viewmodel/:tenantId/ap-groups',
    newApi: true
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group',
    newApi: true
  },
  getApsByApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId/aps',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId/ap',
    newApi: true
  },
  getApGroup: {
    method: 'get',
    url: '/venues/apGroups/:apGroupId',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId',
    newApi: true
  },
  updateApGroup: {
    method: 'put',
    url: '/venues/apGroups/:apGroupId',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId',
    newApi: true
  },
  deleteApGroup: {
    method: 'delete',
    url: '/venues/apGroups/:apGroupId',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId',
    newApi: true
  },
  deleteApGroups: {
    method: 'delete',
    url: '/venues/apGroups',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group',
    newApi: true
  },
  getDhcpAp: {
    method: 'post',
    url: '/venues/dhcpApSettings/query',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/dhcp-ap',
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
    oldUrl: '/api/tenant/:tenantId/wifi/ap',
    newApi: true
  },
  deleteSoloAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber?resetFirmware=true',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber?resetFirmware=true',
    newApi: true
  },
  deleteSoloAps: {
    method: 'delete',
    url: '/venues/aps/?resetFirmware=true',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/?resetFirmware=true',
    newApi: true
  },
  downloadApLog: {
    method: 'get',
    url: '/venues/aps/:serialNumber/logs',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/download-log',
    newApi: true
  },
  rebootAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/reboot',
    newApi: true
  },
  factoryResetAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/factory-reset',
    newApi: true
  },
  getApPhoto: {
    method: 'get',
    url: '/venues/aps/:serialNumber/pictures',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture',
    newApi: true
  },
  addApPhoto: {
    method: 'put',
    url: '/venues/aps/:serialNumber/pictures',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture/deep',
    newApi: true
  },
  deleteApPhoto: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/pictures',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture',
    newApi: true
  },
  getApRadioCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio',
    newApi: true
  },
  updateApRadioCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio',
    newApi: true
  },
  deleteApRadioCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/radioSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio',
    newApi: true
  },
  pingAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ping',
    newApi: true
  },
  traceRouteAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/trace-route',
    newApi: true
  },
  startPacketCapture: {
    method: 'post',
    url: '/venues/aps/:serialNumber/packets',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture/start',
    newApi: true
  },
  stopPacketCapture: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/packets',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture/stop',
    newApi: true
  },
  getPacketCaptureState: {
    method: 'get',
    url: '/venues/aps/:serialNumber/packets',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture',
    newApi: true
  },
  blinkLedAp: {
    method: 'PATCH',
    url: '/venues/aps/:serialNumber',
    oldMethod: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/blink-led',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    url: '/venues/aps/:serialNumber/capabilities',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/capabilities',
    newApi: true
  },
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/dpskPassphrasePools/query',
    oldUrl: '/api/tenant/:tenantId/wifi/dpsk-passphrase/query',
    newApi: true
  },
  getApLanPorts: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port',
    newApi: true
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port',
    newApi: true
  },
  resetApLanPorts: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port',
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
  getApCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization',
    newApi: true
  },
  updateApCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization',
    newApi: true
  },
  resetApCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/venues/:venueId/directedMulticastSettings',
    oldUrl: '/api/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/venues/:venueId/directedMulticastSettings',
    oldUrl: '/api/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getApDirectedMulticast: {
    method: 'get',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    oldUrl: '/api/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  updateApDirectedMulticast: {
    method: 'put',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    oldUrl: '/api/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  resetApDirectedMulticast: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/directedMulticastSettings',
    oldUrl: '/api/venues/aps/:serialNumber/directedMulticastSettings',
    newApi: true
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/venues/:venueId/loadBalancingSettings',
    oldUrl: '/api/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/venues/:venueId/loadBalancingSettings',
    oldUrl: '/api/venues/:venueId/loadBalancingSettings',
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
  getApNetworkSettings: {
    method: 'get',
    url: '/venues/aps/:serialNumber/networkSettings',
    oldUrl: '/api/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  updateApNetworkSettings: {
    method: 'put',
    url: '/venues/aps/:serialNumber/networkSettings',
    oldUrl: '/api/venues/aps/:serialNumber/networkSettings',
    newApi: true
  },
  resetApNetworkSettings: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/networkSettings',
    oldUrl: '/api/venues/aps/:serialNumber/networkSettings',
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
  }
}
