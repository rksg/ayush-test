import { ApiInfo } from '../../apiService'


export const NetworkSegmentationUrls: { [key: string]: ApiInfo } = {
  getNetworkSegmentationGroupById: {
    method: 'get',
    newApi: true,
    url: '/networkSegmentationGroups/:serviceId'
  },
  getNetworkSegmentationGroupList: {
    method: 'get',
    newApi: true,
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
  },
  updateNetworkSegmentationGroup: {
    method: 'put',
    newApi: true,
    url: '/networkSegmentationGroups/:serviceId'
  }
}
