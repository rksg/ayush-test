import { ApiInfo } from '../apiService'

// TODO: update this when I change the root path?
export const msgTemplateBaseUrl = '/msgtemplate'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type MsgTemplateUrlType =
  'getTemplateScopeById'

export const MsgTemplateUrls: { [key in MsgTemplateUrlType]: ApiInfo } = {
  getTemplateScopeById: {
    method: 'get',
    url: msgTemplateBaseUrl + '/templateScopes/:templateScopeId'
  }
}
