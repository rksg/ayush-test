import { ApiInfo } from '@acx-ui/utils'


export const EdgePinUrls: { [key: string]: ApiInfo } = {
  getEdgePinById: {
    method: 'get',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
  },
  createEdgePin: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks',
    opsApi: 'POST:/personalIdentityNetworks'
  },
  getEdgePinStatsList: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks/query',
    opsApi: 'POST:/personalIdentityNetworks/query'
  },
  deleteEdgePin: {
    method: 'delete',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId',
    opsApi: 'DELETE:/personalIdentityNetworks/{id}'
  },
  updateEdgePin: {
    method: 'put',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId',
    opsApi: 'PUT:/personalIdentityNetworks/{id}'
  },
  activateEdgePinNetwork: {
    method: 'put',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId/wifiNetworks/:wifiNetworkId'
  },
  deactivateEdgePinNetwork: {
    method: 'delete',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId/wifiNetworks/:wifiNetworkId'
  },
  validateSwitchConfig: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks/validateSwitchConfig'
  },
  validateEdgeClusterConfig: {
    method: 'post',
    url: '/personalIdentityNetworks/validateEdgeClusterConfig',
    newApi: true
  },
  getWebAuthTemplate: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId'
  },
  getWebAuthTemplateSwitches: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId/switches'
  },
  getWebAuthTemplateList: {
    method: 'post',
    newApi: true,
    url: '/webAuthPageTemplates/query',
    opsApi: 'POST:/webAuthPageTemplates/query'
  },
  addWebAuthTemplate: {
    method: 'post',
    newApi: true,
    url: '/webAuthPageTemplates',
    opsApi: 'POST:/webAuthPageTemplates'
  },
  updateWebAuthTemplate: {
    method: 'put',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId',
    opsApi: 'PUT:/webAuthPageTemplates/{id}'
  },
  deleteWebAuthTemplate: {
    method: 'delete',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId',
    opsApi: 'DELETE:/webAuthPageTemplates/{id}'
  },

  getAvailableSwitches: {
    method: 'get',
    url: '/venues/:venueId/personalIdentityNetworks',
    newApi: true
  },
  getSwitchInfoByPinId: {
    method: 'get',
    url: '/venues/:venueId/personalIdentityNetworks/:serviceId',
    newApi: true
  },
  validateDistributionSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/personalIdentityNetworks/distributionSwitchInfo',
    newApi: true
  },
  validateAccessSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/personalIdentityNetworks/accessSwitchInfo',
    newApi: true
  }
}
