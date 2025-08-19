import { ApiInfo } from '@acx-ui/utils'

export const EdgeConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  activateSdLanNetworkTemplate: {
    method: 'put',
    url: '/edgeSdLanServices/:serviceId/templates/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateSdLanNetworkTemplate: {
    method: 'delete',
    url: '/edgeSdLanServices/:serviceId/templates/venues/:venueId/wifiNetworks/:wifiNetworkId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  addTunnelProfileTemplate: {
    method: 'post',
    url: '/templates/tunnelServiceProfiles',
    newApi: true,
    opsApi: 'POST:/templates/tunnelServiceProfiles'
  },
  getTunnelProfileTemplate: {
    method: 'get',
    url: '/templates/tunnelServiceProfiles/:id',
    newApi: true
  },
  updateTunnelProfileTemplate: {
    method: 'put',
    url: '/templates/tunnelServiceProfiles/:id',
    newApi: true,
    opsApi: 'PUT:/templates/tunnelServiceProfiles/{id}'
  },
  deleteTunnelProfileTemplate: {
    method: 'delete',
    url: '/templates/tunnelServiceProfiles/:templateId',
    newApi: true,
    opsApi: 'DELETE:/templates/tunnelServiceProfiles/{id}'
  },
  getTunnelProfileTemplateViewDataListSkipRecRewrite: {
    method: 'post',
    url: '/templates/tunnelServiceProfiles/query',
    newApi: true,
    skipRecRewrite: true
  }
}