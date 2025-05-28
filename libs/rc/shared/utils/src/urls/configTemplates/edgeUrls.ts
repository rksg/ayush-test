import { ApiInfo } from '@acx-ui/utils'

export const EdgeConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  activateSdLanNetworkTemplate: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deactivateSdLanNetworkTemplate: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  }
}