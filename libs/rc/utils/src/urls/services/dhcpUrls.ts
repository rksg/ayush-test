import { ApiInfo } from '@acx-ui/utils'

export const DHCPUrls: { [key: string]: ApiInfo } = {
  addDHCPService: {
    method: 'post',
    url: '/dhcpConfigServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile',
    newApi: true
  },
  updateDHCPService: {
    method: 'put',
    url: '/dhcpConfigServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId',
    newApi: true
  },
  getDHCProfileDetail: {
    method: 'get',
    url: '/dhcpConfigServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId',
    newApi: true
  },
  deleteDHCPProfile: {
    method: 'delete',
    url: '/dhcpConfigServiceProfiles/:serviceId',
    oldUrl: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId',
    newApi: true
  },
  getDHCPProfiles: {
    //Get DHCP Profiles LIST
    method: 'get',
    url: '/dhcpConfigServiceProfiles',
    oldUrl: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile',
    newApi: true
  },
  getDHCPProfilesViewModel: {
    //Get DHCP Profiles LIST
    method: 'post',
    url: '/enhancedDhcpConfigServiceProfiles/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedDhcpConfigServiceProfiles/query',
    newApi: true
  },
  getVenueDHCPServiceProfile: {
    //Retrieve Venue DHCP Service Profile Settings
    method: 'get',
    url: '/venues/:venueId/dhcpConfigServiceProfileSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpConfigServiceProfile',
    newApi: true
  },
  getVenueActivePools: {
    //Venue Active DhcpPool list
    method: 'get',
    url: '/venues/:venueId/dhcpPools',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool',
    newApi: true
  },
  getVenueLeases: {
    //Get Venue Venue Leases data
    method: 'get',
    url: '/venues/:venueId/dhcpPoolLeases',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPoolLease',
    newApi: true
  },
  activeVenueDHCPPool: {
    //set DHCP Pool Active
    method: 'post',
    url: '/venues/:venueId/dhcpPools/:dhcppoolId',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool/:dhcppoolId',
    newApi: true
  },
  deactivateVenueDHCPPool: {
    //set DHCP Pool Deactivate
    method: 'delete',
    url: '/venues/:venueId/dhcpPools/:dhcppoolId',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool/:dhcppoolId',
    newApi: true
  },
  updateVenueDHCPProfile: {
    //Setup Venue DHCP Service Profile
    method: 'post',
    url: '/venues/:venueId/dhcpConfigServiceProfileSettings',
    oldUrl: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpConfigServiceProfile',
    newApi: true
  }
}
