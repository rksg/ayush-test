import { ApiInfo } from '@acx-ui/utils'


export const NetworkSegmentationUrls: { [key: string]: ApiInfo } = {
  getNetworkSegmentationGroupById: {
    method: 'get',
    newApi: true,
    url: '/networkSegmentationGroups/:serviceId'
  },
  getNetworkSegmentationGroupList: {
    method: 'get',
    newApi: true,
    url: '/networkSegmentationGroups?size=:pageSize&page=:page&sort=:sort'
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
    url: '/venues/:venueId/networkSegmentations',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations',
    newApi: true
  },
  getSwitchInfoByNSGId: {
    method: 'get',
    url: '/venues/:venueId/networkSegmentations/:serviceId',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/:serviceId',
    newApi: true
  },

  validateDistributionSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/networkSegmentations/distributionSwitchInfo',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/distributionSwitchInfo',
    newApi: true
  },
  validateAccessSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/networkSegmentations/accessSwitchInfo',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/accessSwitchInfo',
    newApi: true
  },
  createNetworkSegmentationGroup: {
    method: 'post',
    newApi: true,
    url: '/networkSegmentationGroups'
  },
  getNetworkSegmentationStatsList: {
    method: 'post',
    newApi: true,
    url: '/networkSegmentationGroups/query'
  },
  deleteNetworkSegmentationGroup: {
    method: 'delete',
    newApi: true,
    url: '/networkSegmentationGroups/:serviceId'
  },
  updateNetworkSegmentationGroup: {
    method: 'put',
    newApi: true,
    url: '/networkSegmentationGroups/:serviceId'
  }
}
