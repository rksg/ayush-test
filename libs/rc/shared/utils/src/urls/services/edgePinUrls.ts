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
    url: '/personalIdentityNetworks'
  },
  getEdgePinStatsList: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks/query'
  },
  deleteEdgePin: {
    method: 'delete',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
  },
  updateEdgePin: {
    method: 'put',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
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
  validateEdgePinNetwork: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks/validateSwitchConfig'
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
    url: '/webAuthPageTemplates/query'
  },
  addWebAuthTemplate: {
    method: 'post',
    newApi: true,
    url: '/webAuthPageTemplates'
  },
  updateWebAuthTemplate: {
    method: 'put',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId'
  },
  deleteWebAuthTemplate: {
    method: 'delete',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId'
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
  },
  validateEdgeClusterConfig: {
    method: 'post',
    url: '/personalIdentityNetworks/validateEdgeClusterConfig',
    newApi: true
  }
}
