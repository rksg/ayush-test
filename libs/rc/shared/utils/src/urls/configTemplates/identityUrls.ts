import { ApiInfo } from '@acx-ui/utils'

export const BaseIdentityTemplateUrl = '/templates/identityGroups'
const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type IdentityTemplateUrlType =
  'getIdentityGroupTemplateById' | 'updateIdentityGroupTemplate' | 'deleteIdentityGroupTemplate' |
  'addIdentityGroupTemplate' | 'queryIdentityGroupTemplates'

export const IdentityTemplateUrlsInfo: { [key in IdentityTemplateUrlType]: ApiInfo } = {
  addIdentityGroupTemplate: {
    method: 'post',
    url: BaseIdentityTemplateUrl,
    opsApi: `POST:${BaseIdentityTemplateUrl}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  getIdentityGroupTemplateById: {
    method: 'get',
    url: `${BaseIdentityTemplateUrl}/:groupId`,
    opsApi: `GET:${BaseIdentityTemplateUrl}/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  queryIdentityGroupTemplates: {
    method: 'post',
    url: `${BaseIdentityTemplateUrl}/query${paginationParams}`,
    opsApi: `POST:${BaseIdentityTemplateUrl}/query`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  updateIdentityGroupTemplate: {
    method: 'PATCH',
    url: `${BaseIdentityTemplateUrl}/:groupId`,
    opsApi: `PATCH:${BaseIdentityTemplateUrl}/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteIdentityGroupTemplate: {
    method: 'delete',
    url: `${BaseIdentityTemplateUrl}/:templateId`,
    opsApi: `DELETE:${BaseIdentityTemplateUrl}/{id}`,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  }
}
