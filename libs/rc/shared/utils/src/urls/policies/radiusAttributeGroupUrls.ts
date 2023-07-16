import { ApiInfo } from '@acx-ui/utils'

const attributeGroupsBaseUrl = '/radiusAttributeGroups'
const attributeBaseUrl = '/radiusAttributes'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RadiusAttributeGroupUrlsInfo: { [key: string]: ApiInfo } = {
  getAttribute: {
    method: 'get',
    newApi: true,
    url: attributeBaseUrl + '/:attributeId'
  },
  getAttributes: {
    method: 'get',
    newApi: true,
    url: attributeBaseUrl + '?size=:pageSize&page=:page'
  },
  getAttributesWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeBaseUrl + '/query'
  },
  getAttributeGroups: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + paginationParams
  },
  getAttributeGroupsWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl + '/query?excludeContent=:excludeContent'
  },
  createAttributeGroup: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl
  },
  getAttributeGroup: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  deleteAttributeGroup: {
    method: 'delete',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  updateAttributeGroup: {
    method: 'PATCH',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  getAttributeVendors: {
    method: 'get',
    newApi: true,
    url: attributeBaseUrl + '/vendors'
  },
  createAssignment: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments'
  },
  getAssignment: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments/:assignmentId'
  },
  deleteAssignment: {
    method: 'delete',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments/:assignmentId'
  },
  getAssignments: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments' + paginationParams
  }
}
