import { ApiInfo } from '../../apiService'

export const DHCPUrls: { [key: string]: ApiInfo } = {
  addDHCPService: {
    method: 'post',
    url: '/dhcpConfigServiceProfiles'
  },
  updateDHCPService: {
    method: 'put',
    url: '/dhcpConfigServiceProfiles/:serviceId'
  },
  getDHCProfileDetail: {
    method: 'get',
    url: '/dhcpConfigServiceProfiles/:serviceId'
  },
  deleteDHCPProfile: {
    method: 'delete',
    url: '/dhcpConfigServiceProfiles/:serviceId'
    // /dhcpConfigServiceProfiles/{dhcpConfigServiceProfileId}
  },
  getDHCPProfiles: {
    //Get DHCP Profiles LIST
    method: 'get',
    url: '/dhcpConfigServiceProfiles'
  },
  getDHCPProfilesViewModel: {
    //Get DHCP Profiles LIST
    method: 'post',
    url: '/enhancedDhcpConfigServiceProfiles/query'
  },
  getVenueDHCPServiceProfile: {
    //Retrieve Venue DHCP Service Profile Settings
    method: 'get',
    url: '/venues/:venueId/dhcpConfigServiceProfileSettings'
  },
  getVenueActivePools: {
    //Venue Active DhcpPool list
    method: 'get',
    url: '/venues/:venueId/dhcpPools'
  },
  getVenueLeases: {
    //Get Venue Venue Leases data
    method: 'get',
    url: '/venues/:venueId/dhcpPoolLeases'
    // url: '/api/venues/:venueId/dhcpConfigServiceProfileLeases'
  },
  activeVenueDHCPPool: {
    //set DHCP Pool Active
    method: 'post',
    url: '/venues/:venueId/dhcpPools/:dhcppoolId'
  },
  deactivateVenueDHCPPool: {
    //set DHCP Pool Deactivate
    method: 'delete',
    url: '/venues/:venueId/dhcpPools/:dhcppoolId'
  },
  updateVenueDHCPProfile: {
    //Setup Venue DHCP Service Profile
    method: 'post',
    url: '/venues/:venueId/dhcpConfigServiceProfileSettings'
  }
}
