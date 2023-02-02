import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  GetDefaultDhcpServiceProfileForGuestNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcp-service-profile/guest-network-default'
  },
  getVlanPools: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/vlan-pool'
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
    url: '/api/tenant/:tenantId/wifi/network-venue'
  },
  updateNetworkVenue: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/network-venue/:networkVenueId?quickAck=true'
  },
  deleteNetworkVenue: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/network-venue/:networkVenueId'
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna'
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna'
  },
  getVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/valid-channels'
  },
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio/default'
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio'
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio'
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
    url: '/api/tenant/:tenantId/wifi/lte-band'
  },
  getVenueApModelCellular: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular'
  },
  updateVenueCellularSettings: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular'
  },
  getAp: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber?operational=false'
  },
  getApLanPorts: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port'
  },
  getApValidChannel: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/valid-channel'
  },
  getWifiCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/capabilities'
  },
  addAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap'
  },
  updateAp: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber'
  },
  getVenueDefaultApGroup: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/default-ap-group'
  },
  getApGroupsList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/ap-groups'
  },
  addApGroup: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap-group'
  },
  getDhcpAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/dhcp-ap'
  },
  deleteAp: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber'
  },
  deleteAps: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap'
  },
  deleteSoloAp: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber?resetFirmware=true'
  },
  deleteSoloAps: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/?resetFirmware=true'
  },
  downloadApLog: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/download-log'
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
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture'
  },
  addApPhoto: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture/deep'
  },
  deleteApPhoto: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture'
  },
  getApRadioCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio'
  },
  updateApRadioCustomization: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio'
  },
  deleteApRadioCustomization: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/radio'
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
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture'
  },
  blinkLedAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/blink-led'
  },
  updateApLanPorts: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port'
  },
  getApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/capabilities'
  },
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/dpsk-passphrase/query'
  },
  getApCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization'
  },
  updateApCustomization: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization'
  },
  resetApCustomization: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/customization'
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
