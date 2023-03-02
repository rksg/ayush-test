import { ApiInfo } from '../apiService'

export const msgTemplateBaseUrl = '/templateScopes'

export const MsgTemplateUrls: { [key: string]: ApiInfo } = {
  getTemplateScopeById: {
    method: 'get',
    url: msgTemplateBaseUrl + '/:templateScopeId'
  },
  getAllTemplatesByTemplateScopeId: {
    method: 'get',
    // Note: Hardcoded page size - don't use this if you want to adjust page parameters
    url: msgTemplateBaseUrl + '/:templateScopeId/templates?size=5000'
  },
  getRegistrationById: {
    method: 'get',
    url: msgTemplateBaseUrl + '/:templateScopeId/registrations/:registrationId'
  },
  putRegistrationById: {
    method: 'put',
    url: msgTemplateBaseUrl + '/:templateScopeId/registrations/:registrationId'
  }
}
