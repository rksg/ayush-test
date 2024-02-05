import { ApiInfo } from '@acx-ui/utils'

export const VenueConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getVenueApCapabilities: {
    method: 'get',
    url: '/templates/venues/:venueId/aps/capabilities',
    newApi: true
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
  getDefaultRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings?defaultOnly=true',
    newApi: true
  },
  getVenueRadioCustomization: {
    method: 'get',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  updateVenueRadioCustomization: {
    method: 'put',
    url: '/templates/venues/:venueId/radioSettings',
    newApi: true
  },
  getVenueLoadBalancing: {
    method: 'get',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  updateVenueLoadBalancing: {
    method: 'put',
    url: '/templates/venues/:venueId/loadBalancingSettings',
    newApi: true
  },
  getVenueClientAdmissionControl: {
    method: 'get',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  updateVenueClientAdmissionControl: {
    method: 'put',
    url: '/templates/venues/:venueId/clientAdmissionControlSettings',
    newApi: true
  },
  getVenueExternalAntenna: {
    method: 'get',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  updateVenueExternalAntenna: {
    method: 'put',
    url: '/templates/venues/:venueId/externalAntennaSettings',
    newApi: true
  },
  getVenueSettings: {
    method: 'get',
    url: '/templates/venues/:venueId/wifiSettings',
    newApi: true
  },
  getVenueLanPorts: {
    method: 'get',
    url: '/templates/venues/:venueId/lanPortSettings',
    newApi: true
  },
  getVenueDirectedMulticast: {
    method: 'get',
    url: '/templates/venues/:venueId/directedMulticastSettings',
    newApi: true
  },
  getVenueRadiusOptions: {
    method: 'get',
    url: '/templates/venues/:venueId/radiusOptions',
    newApi: true
  },
  getDenialOfServiceProtection: {
    method: 'get',
    url: '/templates/venues/:venueId/dosProtectionSettings',
    newApi: true
  },
  getVenueBssColoring: {
    method: 'get',
    url: '/templates/venues/:venueId/bssColoringSettings',
    newApi: true
  }
}
