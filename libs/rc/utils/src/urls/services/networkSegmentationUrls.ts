import { ApiInfo } from '../../apiService'


export const NetworkSegmentationUrls: { [key: string]: ApiInfo } = {
  getNetworkSegmentationGroupById: {
    method: 'get',
    url: '/networkSegmentationGroups/:serviceId'
  },
  getNetworkSegmentationGroupList: {
    method: 'get',
    url: '/networkSegmentationGroups'
  },
  getWebAuthTemplate: {
    method: 'get',
    url: '/webAuthPageTemplates/:serviceId'
  },
  getWebAuthTemplateList: {
    method: 'post',
    url: '/webAuthPageTemplates/query'
  },
  addWebAuthTemplate: {
    method: 'post',
    url: '/webAuthPageTemplates'
  },
  updateWebAuthTemplate: {
    method: 'put',
    url: '/webAuthPageTemplates/:serviceId'
  },
  deleteWebAuthTemplate: {
    method: 'delete',
    url: '/webAuthPageTemplates/:serviceId'
  },

  getAvailableSwitches: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations'
  },
  getSwitchInfoByNSGId: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/:serviceId'
  },
  getAccessSwitchesByDS: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations' +
      '/distributions/:switchId/accessSwitches'
  },
  validateDistributionSwitchInfo: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/distributionSwitchInfo'
  },
  validateAccessSwitchInfo: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/accessSwitchInfo'
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
