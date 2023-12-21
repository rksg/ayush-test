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
    url: '/templates/wifiNetworks'
  },
  updateNetworkTemplate: {
    method: 'put',
    url: '/templates/wifiNetworks/:networkId'
  },
  getNetworkTemplate: {
    method: 'get',
    url: '/templates/wifiNetworks/:networkId'
  },
  getNetworkTemplateList: {
    method: 'post',
    url: '/templates/wifiNetworks/query'
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
