import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
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
  }
}
