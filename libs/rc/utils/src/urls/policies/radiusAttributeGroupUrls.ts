import { ApiInfo } from '../../apiService'

const attributeGroupsBaseUrl = '/radiusAttributeGroups'
const attributeBaseUrl = '/radiusAttributes'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RadiusAttributeGroupUrlsInfo: { [key: string]: ApiInfo } = {
  getAttribute: {
    method: 'get',
    url: attributeBaseUrl + '/:attributeId'
  },
  getAttributes: {
    method: 'get',
    url: attributeBaseUrl + '?size=:pageSize&page=:page'
  },
  getAttributesWithQuery: {
    method: 'post',
    url: attributeBaseUrl + '/query'
  },
  getAttributeGroups: {
    method: 'get',
    url: attributeGroupsBaseUrl + paginationParams
  },
  getAttributeGroupsWithQuery: {
    method: 'post',
    url: attributeGroupsBaseUrl + '/query'
  },
  createAttributeGroup: {
    method: 'post',
    url: attributeGroupsBaseUrl
  },
  getAttributeGroup: {
    method: 'get',
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  deleteAttributeGroup: {
    method: 'delete',
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  updateAttributeGroup: {
    method: 'PATCH',
    url: attributeGroupsBaseUrl + '/:policyId'
  },
  getAttributeVendors: {
    method: 'get',
    url: attributeBaseUrl + '/vendors'
  },
  createAssignment: {
    method: 'post',
    url: attributeBaseUrl + '/:policyId/assignments'
  },
  getAssignment: {
    method: 'get',
    url: attributeBaseUrl + '/:policyId/assignments/:assignmentId'
  },
  deleteAssignment: {
    method: 'delete',
    url: attributeBaseUrl + '/:policyId/assignments/:assignmentId'
  },
  getAssignments: {
    method: 'get',
    url: attributeBaseUrl + '/:policyId/assignments' + paginationParams
  }
}
