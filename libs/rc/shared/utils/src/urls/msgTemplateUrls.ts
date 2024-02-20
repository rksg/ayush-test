import { ApiInfo } from '@acx-ui/utils'

export const templateScopeBaseUrl = '/templateScopes'
export const msgCategoriesBaseUrl = '/msgCategories'

export const MsgTemplateUrls: { [key: string]: ApiInfo } = {
  getCategoryById: {
    newApi: true,
    method: 'get',
    url: msgCategoriesBaseUrl + '/:categoryId'
  },
  getTemplateGroupById: {
    newApi: true,
    method: 'get',
    url: msgCategoriesBaseUrl + '/:categoryId/groups/:templateGroupId'
  },
  getAllTemplateGroupsByCategoryId: {
    newApi: true,
    method: 'post',
    url: msgCategoriesBaseUrl + '/:categoryId/groups/query'
  },
  getTemplateScopeByIdWithRegistration: {
    newApi: true,
    method: 'get',
    url: templateScopeBaseUrl + '/:templateScopeId?includes=registrations/:registrationId'
  },
  getAllTemplatesByTemplateScopeId: {
    newApi: true,
    method: 'get',
    // Note: Hardcoded page size - don't use this if you want to adjust page parameters
    url: templateScopeBaseUrl + '/:templateScopeId/templates?size=5000'
  },
  getTemplate: {
    newApi: true,
    method: 'get',
    url: templateScopeBaseUrl + '/:templateScopeId/templates/:templateId'
  },
  getRegistrationById: {
    newApi: true,
    method: 'get',
    url: templateScopeBaseUrl + '/:templateScopeId/registrations/:registrationId'
  },
  putRegistrationById: {
    newApi: true,
    method: 'put',
    url: templateScopeBaseUrl + '/:templateScopeId/:associatedResource/:associatedResourceId'
      + '/registrations/:registrationId'
  }
}
