import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  GetDefaultDhcpServiceProfileForGuestNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcp-service-profile/guest-network-default'
  },
  getVlanPools: {
    method: 'get',
    url: '/vlanPools',
    oldUrl: '/api/tenant/:tenantId/wifi/vlan-pool',
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
  getVenueExternalAntenna: {
    method: 'get',
    url: '/venues/:venueId/externalAntennaSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna',
    newApi: true
  },
  getVenueApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
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
  getApLanPorts: {
    method: 'get',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port',
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
    url: '/api/tenant/:tenantId/wifi/capabilities'
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
  getVenueDefaultApGroup: {
    // new api not working
    // method: 'get',
    // url: '/venues/:venueId/apGroups',
    // oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/default-ap-group',
    // newApi: true
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/default-ap-group'
  },
  getApGroupsList: {
    method: 'post',
    url: '/api/viewmodel/:tenantId/ap-groups'
  },
  addApGroup: {
    method: 'post',
    url: '/venues/:venueId/apGroups',
    oldUrl: '/api/tenant/:tenantId/wifi/ap-group',
    newApi: true
  },
  getApsByApGroup: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId/ap'
  },
  getApGroup: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId'
  },
  updateApGroup: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId'
  },
  deleteApGroup: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap-group/:apGroupId'
  },
  deleteApGroups: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/ap-group'
  },
  getDhcpAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/dhcp-ap'
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
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture',
    newApi: true
  },
  addApPhoto: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/picture/deep'
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
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/ui/packet-capture',
    newApi: true
  },
  blinkLedAp: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/blink-led'
  },
  updateApLanPorts: {
    method: 'put',
    url: '/venues/aps/:serialNumber/lanPortSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/ap/:serialNumber/lan-port',
    newApi: true
  },
  getApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/ap/:serialNumber/capabilities'
  },
  getDpskPassphraseByQuery: {
    method: 'post',
    url: '/dpskPassphrasePools/query',
    oldUrl: '/api/tenant/:tenantId/wifi/dpsk-passphrase/query',
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
