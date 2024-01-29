import { ApiInfo } from '@acx-ui/utils'

export const ConfigTemplateUrlsInfo: { [key: string]: ApiInfo } = {
  getConfigTemplates: {
    method: 'post',
    url: '/templates/query',
    newApi: true
  },
  applyConfigTemplate: {
    method: 'post',
    url: '/templates/:templateId/tenant/:tenantId',
    newApi: true
  },
  addNetworkTemplate: {
    method: 'post',
    url: '/templates/networks',
    newApi: true
  },
  updateNetworkTemplate: {
    method: 'put',
    url: '/templates/networks/:networkId',
    newApi: true
  },
  getNetworkTemplate: {
    method: 'get',
    url: '/templates/networks/:networkId',
    newApi: true
  },
  deleteNetworkTemplate: {
    method: 'delete',
    url: '/templates/networks/:templateId',
    newApi: true
  },
  getNetworkTemplateList: {
    method: 'post',
    url: '/templates/networks/query',
    newApi: true
  },
  addAAAPolicyTemplate: {
    method: 'post',
    url: '/templates/radiusServerProfiles',
    newApi: true
  },
  getAAAPolicyTemplate: {
    method: 'get',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true
  },
  deleteAAAPolicyTemplate: {
    method: 'delete',
    url: '/templates/radiusServerProfiles/:templateId',
    newApi: true
  },
  updateAAAPolicyTemplate: {
    method: 'put',
    url: '/templates/radiusServerProfiles/:policyId',
    newApi: true
  },
  getAAAPolicyTemplateList: {
    method: 'post',
    url: '/templates/radiusServerProfiles/query',
    newApi: true
  }
}
