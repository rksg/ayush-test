import { ApiInfo } from '../../apiService'

export const NetworkSegmentationUrls: { [key: string]: ApiInfo } = {
  getWebAuthTemplate: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/:templateId'
  },
  getWebAuthTemplateList: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates'
  },
  addWebAuthTemplate: {
    method: 'post',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/template'
  },
  updateWebAuthTemplate: {
    method: 'put',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/template/:templateId'
  },
  deleteWebAuthTemplate: {
    method: 'delete',
    url: '/api/switch/tenant/:tenantId/webAuthPageTemplates/template/:templateId'
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
