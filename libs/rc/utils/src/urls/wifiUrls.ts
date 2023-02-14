import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  GetDefaultDhcpServiceProfileForGuestNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcp-service-profile/guest-network-default'
  },
  getVlanPools: {
    method: 'get',
    url: '/vlanPools',
    newApi: true
  },
  getNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/network/:networkId/deep'
  },
  addNetworkDeep: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/network/deep?quickAck=true'
  },
  updateNetworkDeep: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/network/:networkId/deep?quickAck=true'
  },
  deleteNetwork: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/network/:networkId'
  },
  addNetworkVenue: {
    method: 'post',
    url: '/networkActivations',
    newApi: true
  },
  updateNetworkVenue: {
    method: 'put',
    url: '/networkActivations/:networkVenueId?quickAck=true',
    newApi: true
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/networkActivations/:networkVenueId',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/venues/:venueId/channels',
    newApi: true
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/venues/:venueId/radioSettings',
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
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band'
  },
  updateVenueTripleBandRadioSettings: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band'
  },
  getLteBandLockChannel: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/lte-band-lock-channel'
  },
  getAvailableLteBands: {
    method: 'get',
    url: '/venues/lteBands',
    newApi: true
  },
  getVenueApModelCellular: {
    method: 'get',
    url: '/venues/:venueId/cellularSettings',
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
  getApLanPorts: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  getApValidChannel: {
    method: 'get',
    url: '/venues/aps/:serialNumber/channels',
    newApi: true
  },
  getWifiCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities'
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
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },
  getApGroupsList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/ap-groups'
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    newApi: true
  },
  getDhcpAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/dhcp-ap'
  },
  deleteAp: {
    method: 'delete',
    url: '/venues/aps/:serialNumber',
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
  apAction: {
    method: 'patch',
    url: '/venues/aps/:serialNumber',
    newApi: true
  },
  rebootAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/reboot'
  },
  factoryResetAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/factory-reset'
  },
  getApPhoto: {
    method: 'get',
    url: '/venues/aps/:serialNumber/pictures',
    newApi: true
  },
  addApPhoto: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture/deep'
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
  deleteApRadioCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/radioSettings',
    newApi: true
  },
  pingAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ping'
  },
  traceRouteAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/trace-route'
  },
  startPacketCapture: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture/start'
  },
  stopPacketCapture: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture/stop'
  },
  getPacketCaptureState: {
    method: 'get',
    url: '/venues/aps/:serialNumber/packets',
    newApi: true
  },
  blinkLedAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/blink-led'
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/capabilities'
  },
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/dpskPassphrasePools/query',
    newApi: true
  },
  getApCustomization: {
    method: 'get',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    newApi: true
  },
  updateApCustomization: {
    method: 'put',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    newApi: true
  },
  resetApCustomization: {
    method: 'delete',
    url: '/venues/aps/:serialNumber/wifiOverwriteSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/api/venues/:venueId/directedMulticastSettings'
  },
  updateVenueDirectedMulticast: {
    method: 'put',
    url: '/api/venues/:venueId/directedMulticastSettings'
  },
  getApDirectedMulticast: {
    method: 'get',
    url: '/api/venues/aps/:serialNumber/directedMulticastSettings'
  },
  updateApDirectedMulticast: {
    method: 'put',
    url: '/api/venues/aps/:serialNumber/directedMulticastSettings'
  },
  resetApDirectedMulticast: {
    method: 'delete',
    url: '/api/venues/aps/:serialNumber/directedMulticastSettings'
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/api/venues/:venueId/loadBalancingSettings'
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/api/venues/:venueId/loadBalancingSettings'
  },
  getApNetworkSettings: {
    method: 'get',
    url: '/api/venues/aps/:serialNumber/networkSettings'
  },
  updateApNetworkSettings: {
    method: 'put',
    url: '/api/venues/aps/:serialNumber/networkSettings'
  },
  resetApNetworkSettings: {
    method: 'delete',
    url: '/api/venues/aps/:serialNumber/networkSettings'
  }
}
