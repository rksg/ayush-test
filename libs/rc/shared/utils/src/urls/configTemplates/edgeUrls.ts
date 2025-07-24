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
  addTunnelProfileTemplate: {
    method: 'post',
    url: '/templates/tunnelServiceProfiles',
    newApi: true
  },
  getTunnelProfileTemplate: {
    method: 'get',
    url: '/templates/tunnelServiceProfiles/:id',
    newApi: true
  },
  updateTunnelProfileTemplate: {
    method: 'put',
    url: '/templates/tunnelServiceProfiles/:id',
    newApi: true
  },
  deleteTunnelProfileTemplate: {
    method: 'delete',
    url: '/templates/tunnelServiceProfiles/:id',
    newApi: true
  },
  getTunnelProfileTemplateViewDataList: {
    method: 'post',
    url: '/templates/tunnelServiceProfiles/query',
    newApi: true
  }
}