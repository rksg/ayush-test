import { ApiInfo } from '@acx-ui/utils'

const attributeGroupsBaseUrl = '/radiusAttributeGroups'
const attributeBaseUrl = '/radiusAttributes'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RadiusAttributeGroupUrlsInfo: { [key: string]: ApiInfo } = {
  getAttribute: {
    method: 'get',
    newApi: true,
    url: attributeBaseUrl + '/:attributeId',
    opsApi: 'GET:/radiusAttributes/{id}'
  },
  getAttributesWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeBaseUrl + '/query',
    opsApi: 'POST:/radiusAttributes/query'
  },
  getAttributeGroupsWithQuery: {
    method: 'post',
    newApi: true,
    url: attributeGroupsBaseUrl + '/query?excludeContent=:excludeContent',
    opsApi: 'POST:/radiusAttributeGroups/query'
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
    url: attributeGroupsBaseUrl + '/:policyId',
    opsApi: 'GET:/radiusAttributeGroups/{id}'
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
    url: attributeBaseUrl + '/vendors',
    opsApi: 'GET:/radiusAttributes/vendors'
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
    url: attributeGroupsBaseUrl + '/:policyId/assignments/:assignmentId',
    opsApi: 'GET:/radiusAttributeGroups/{id}/assignments/{id}'
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
    url: attributeGroupsBaseUrl + '/:policyId/assignments' + paginationParams,
    opsApi: 'GET:/radiusAttributeGroups/{id}/assignments/'
  }
}
