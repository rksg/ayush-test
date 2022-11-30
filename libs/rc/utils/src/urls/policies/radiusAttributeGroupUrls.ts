import { ApiInfo } from '../../apiService'

const attributeGroupsBaseUrl = '/radiusAttributeGroups'
const attributeBaseUrl = '/radiusAttributes'

export const RadiusAttributeGroupUrlsInfo: { [key: string]: ApiInfo } = {
  getAttributes: {
    method: 'get',
    url: attributeBaseUrl
  },
  getAttributesWithQuery: {
    method: 'post',
    url: attributeBaseUrl + '/query'
  },
  getAttributeGroups: {
    method: 'get',
    url: attributeGroupsBaseUrl
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
  }
}
