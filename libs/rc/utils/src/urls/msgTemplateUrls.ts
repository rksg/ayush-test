import { ApiInfo } from '../apiService'

export const msgTemplateBaseUrl = '/api/msgTemplate'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type MsgTemplateUrlType =
  'getTemplateScopeById'

export const MsgTemplateUrls: { [key in MsgTemplateUrlType]: ApiInfo } = {
  getTemplateScopeById: {
    method: 'get',
    url: msgTemplateBaseUrl + '/templateScopes/:templateScopeId'
  }
}
