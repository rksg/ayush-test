import { ApiInfo } from '@acx-ui/utils'


export const NetworkSegmentationUrls: { [key: string]: ApiInfo } = {
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
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/personalIdentityNetworks',
    newApi: true
  },
  getSwitchInfoByNSGId: {
    method: 'get',
    url: '/venues/:venueId/personalIdentityNetworks/:serviceId',
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/personalIdentityNetworks/:serviceId',
    newApi: true
  },

  validateDistributionSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/personalIdentityNetworks/distributionSwitchInfo',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/personalIdentityNetworks/distributionSwitchInfo',
    newApi: true
  },
  validateAccessSwitchInfo: {
    method: 'post',
    url: '/venues/:venueId/personalIdentityNetworks/accessSwitchInfo',
    // eslint-disable-next-line max-len
    oldUrl: '/api/switch/tenant/:tenantId/venues/:venueId/personalIdentityNetworks/accessSwitchInfo',
    newApi: true
  },
  createNetworkSegmentationGroup: {
    method: 'post',
    newApi: true,
    url: '/personalIdentityNetworks'
  },
  getpersonalIdentityNetworkstatsList: {
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
