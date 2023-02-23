import { ApiInfo } from '../apiService'

// TODO: update this when I change the root path
export const msgTemplateBaseUrl = '/msgtemplate'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const MsgTemplateUrls: { [key: string]: ApiInfo } = {
  getTemplateScopeById: {
    method: 'get',
    url: msgTemplateBaseUrl + '/templateScopes/:templateScopeId'
  },
  getAllTemplatesByTemplateScopeId: {
    method: 'get',
    // Note: Hardcoded page size - don't use this if you want to adjust page parameters
    url: msgTemplateBaseUrl + '/templateScopes/:templateScopeId/templates?size=5000'
  }
}
