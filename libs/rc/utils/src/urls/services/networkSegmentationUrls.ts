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
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/:serviceId'
  },
  getWebAuthTemplateList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/query'
  },
  addWebAuthTemplate: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates'
  },
  updateWebAuthTemplate: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/:serviceId'
  },
  deleteWebAuthTemplate: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/:serviceId'
  },

  getAvailableSwitches: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations'
  },
  getSwitchesByServiceId: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations/:serviceId'
  },
  getAvailableSwitchesByDsId: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/venues/:venueId/networkSegmentations' +
      '/distributions/:switchId/accessSwitches'
  },
  validateDistributionSwitchInfo: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/distributionSwitchInfo'
  },
  validateAccessSwitchInfo: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/accessSwitchInfo'
  },
  getAccessSwitches: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/accessSwitches'
  },
  getDistributionSwitches: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/distributionSwitches'
  }
}
