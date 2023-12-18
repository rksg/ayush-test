import { ApiInfo } from '@acx-ui/utils'

export const ConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getConfigTemplates: {
    method: 'post',
    url: '/templates'
  },
  applyConfigTemplate: {
    method: 'post',
    url: '/templates/:templateId/instance'
  },
  addNetworkTemplate: {
    method: 'post',
    url: '/templates/networks'
  },
  updateNetworkTemplate: {
    method: 'put',
    url: '/templates/networks/:networkId'
  },
  getNetworkTemplate: {
    method: 'get',
    url: '/templates/networks/:networkId'
  },
  addAAAPolicyTemplate: {
    method: 'post',
    url: '/templates/radiusServerProfiles'
  },
  getAAAPolicyTemplate: {
    method: 'get',
    url: '/templates/radiusServerProfiles/:policyId'
  },
  updateAAAPolicyTemplate: {
    method: 'put',
    url: '/templates/radiusServerProfiles/:policyId'
  },
  getAAAPolicyTemplateList: {
    method: 'post',
    url: '/templates/enhancedRadiusServerProfiles/query'
  }
}
