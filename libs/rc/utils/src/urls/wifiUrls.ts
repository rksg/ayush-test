import { ApiInfo } from '../apiService'

export const WifiUrlsInfo: { [key: string]: ApiInfo } = {
  GetDefaultDhcpServiceProfileForGuestNetwork: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/dhcp-service-profile/guest-network-default'
  }
}
