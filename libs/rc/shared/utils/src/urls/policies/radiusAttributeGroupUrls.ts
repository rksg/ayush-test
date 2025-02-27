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
  getAttributesWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeBaseUrl + '/query'
  },
  getAttributeGroupsWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl + '/query?excludeContent=:excludeContent'
  },
  createAttributeGroup: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl,
    opsApi: 'POST:/radiusAttributeGroups'
  },
  getAttributeGroup: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  deleteAttributeGroup: {
    method: 'delete',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId',
    opsApi: 'DELETE:/radiusAttributeGroups/{id}'
  },
  updateAttributeGroup: {
    method: 'PATCH',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId',
    opsApi: 'PATCH:/radiusAttributeGroups/{id}'
  },
  getAttributeVendors: {
    method: 'get',
    newApi: true,
    url: attributeBaseUrl + '/vendors'
  },
  createAssignment: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments',
    opsApi: 'POST:/radiusAttributeGroups/{id}/assignments'
  },
  getAssignment: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments/:assignmentId'
  },
  deleteAssignment: {
    method: 'delete',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments/:assignmentId',
    opsApi: 'DELETE:/radiusAttributeGroups/{id}/assignments/{id}'
  },
  getAssignments: {
    method: 'get',
    newApi: true,
    url: attributeGroupsBaseUrl + '/:policyId/assignments' + paginationParams
  }
}
