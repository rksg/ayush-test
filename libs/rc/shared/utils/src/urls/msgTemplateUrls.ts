import { ApiInfo } from '@acx-ui/utils'

export const msgTemplateBaseUrl = '/templateScopes'

export const MsgTemplateUrls: { [key: string]: ApiInfo } = {
  getTemplateScopeById: {
    newApi: true,
    method: 'get',
    url: msgTemplateBaseUrl + '/:templateScopeId'
  },
  getAllTemplatesByTemplateScopeId: {
    newApi: true,
    method: 'get',
    // Note: Hardcoded page size - don't use this if you want to adjust page parameters
    url: msgTemplateBaseUrl + '/:templateScopeId/templates?size=5000'
  },
  getRegistrationById: {
    newApi: true,
    method: 'get',
    url: msgTemplateBaseUrl + '/:templateScopeId/registrations/:registrationId'
  },
  putRegistrationById: {
    newApi: true,
    method: 'put',
    url: msgTemplateBaseUrl + '/:templateScopeId/registrations/:registrationId'
  }
}
