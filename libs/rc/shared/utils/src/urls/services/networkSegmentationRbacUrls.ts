import { ApiInfo } from '@acx-ui/utils'

import { NetworkSegmentationUrls } from './networkSegmentationUrls'

export const NetworkSegmentationRbacUrls: { [key: string]: ApiInfo } = {
  ...NetworkSegmentationUrls,
  getNetworkSegmentationGroupById: {
    method: 'get',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
  },
  getNetworkSegmentationGroupList: {
    method: 'get',
    newApi: true,
    url: '/personalIdentityNetworks?size=:pageSize&page=:page&sort=:sort'
  },
  getWebAuthTemplate: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:serviceId'
  },
  getWebAuthTemplateSwitches: {
    method: 'get',
    newApi: true,
    url: '/webAuthPageTemplates/:templateId/switches/query' //'/webAuthPageTemplates/:serviceId/switches'
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
  getSwitchInfoByNSGId: {
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
  createNetworkSegmentationGroup: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks'
  },
  getNetworkSegmentationStatsList: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks/query'
  },
  deleteNetworkSegmentationGroup: {
    method: 'delete',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
  },
  updateNetworkSegmentationGroup: {
    method: 'put',
    newApi: true,
    url: '/personalIdentityNetworks/:serviceId'
  }
}
