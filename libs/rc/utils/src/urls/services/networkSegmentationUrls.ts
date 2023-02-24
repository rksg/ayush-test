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
  getAccessSwitches: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/accessSwitches'
  },
  getDistributionSwitches: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/venue/:venueId/networkSegmentations/distributionSwitches'
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
  }
}
