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
  GetVenueExternalAntenna: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna'
  },
  GetVenueApCapabilities: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/capabilities'
  },
  UpdateVenueExternalAntenna: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/externalAntenna'
  },
  GetVenueDefaultRegulatoryChannels: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/valid-channels'
  },
  GetDefaultRadioCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio/default'
  },
  GetVenueRadioCustomization: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio'
  },
  UpdateVenueRadioCustomization: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/radio'
  },
  GetVenueTripleBandRadioSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band'
  },
  UpdateVenueTripleBandRadioSettings: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/tri-band'
  },
  getLteBandLockChannel: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/lte-band-lock-channel'
  },
  getAvailableLteBands: {
    method: 'get',
    url: '/api/tenant/:venueId/wifi/lte-band'
  },
  getVenueApModelCellular: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular'
  },
  updateVenueCellularSettings: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/cellular'
  }
}
