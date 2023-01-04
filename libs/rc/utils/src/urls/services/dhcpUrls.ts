import { ApiInfo } from '../../apiService'

export const DHCPUrls: { [key: string]: ApiInfo } = {
  addDHCPService: {
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile'
  },
  updateDHCPService: {
    method: 'put',
    url: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId'
  },
  getDHCProfileDetail: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId'
  },
  deleteDHCPProfile: {
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile/:serviceId'
    // /dhcpConfigServiceProfiles/{dhcpConfigServiceProfileId}
  },
  getDHCPProfiles: {
    //Get DHCP Profiles LIST
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcpConfigServiceProfile'
  },
  getVenueDHCPServiceProfile: {
    //Retrieve Venue DHCP Service Profile Settings
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpConfigServiceProfile'
  },
  getVenueActivePools: {
    //Venue Active DhcpPool list
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool'
  },
  getVenueLeases: {
    //Get Venue Venue Leases data
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPoolLease'
    // url: '/api/venues/:venueId/dhcpConfigServiceProfileLeases'
  },
  activeVenueDHCPPool: {
    //set DHCP Pool Active
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool/:dhcppoolId'
  },
  deactivateVenueDHCPPool: {
    //set DHCP Pool Deactivate
    method: 'delete',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpPool/:dhcppoolId'
  },
  updateVenueDHCPProfile: {
    //Setup Venue DHCP Service Profile
    method: 'post',
    url: '/api/tenant/:tenantId/wifi/venue/:venueId/dhcpConfigServiceProfile'
  }
}
