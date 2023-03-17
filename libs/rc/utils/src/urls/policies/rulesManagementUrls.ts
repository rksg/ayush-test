import { ApiInfo } from '@acx-ui/utils'


const policySetApiBaseUrl = '/policySets'
const policyTemplateApiBaseUrl = '/policyTemplates'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getPolicyTemplateList: {
    method: 'get',
    url: policyTemplateApiBaseUrl + paginationParams
  },
  getPolicies: {
    method: 'get',
    url: policyTemplateApiBaseUrl + '/policies' + paginationParams
  },
  getPoliciesByQuery: {
    method: 'post',
    url: policyTemplateApiBaseUrl + '/policies/query?excludeContent=:excludeContent'
  },
  getPolicyTemplateAttributes: {
    method: 'get',
    url: policyTemplateApiBaseUrl + '/:templateId/attributes' + paginationParams
  },
  getPoliciesByTemplate: {
    method: 'get',
    url: policyTemplateApiBaseUrl + '/:templateId' + paginationParams
  },
  getPolicyByTemplate: {
    method: 'get',
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  getConditionsInPolicy: {
    method: 'get',
    // eslint-disable-next-line max-len
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions?size=:pageSize&page=:page'
  },
  addConditions: {
    method: 'post',
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions'
  },
  createPolicy: {
    method: 'post',
    url: policyTemplateApiBaseUrl + '/:templateId/policies'
  },
  updatePolicy: {
    method: 'PATCH',
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  deletePolicy: {
    method: 'delete',
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  deleteConditions: {
    method: 'delete',
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions/:conditionId'
  },
  getPolicySets: {
    method: 'get',
    url: policySetApiBaseUrl + paginationParams
  },
  getPolicySet: {
    method: 'get',
    url: policySetApiBaseUrl + '/:policySetId'
  },
  createPolicySet: {
    method: 'post',
    url: policySetApiBaseUrl
  },
  deletePolicySet: {
    method: 'delete',
    url: policySetApiBaseUrl + '/:policySetId'
  },
  updatePolicySet: {
    method: 'PATCH',
    url: policySetApiBaseUrl + '/:policySetId'
  },
  getPrioritizedPolicies: {
    method: 'get',
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies'
  },
  getPolicySetsByQuery: {
    method: 'post',
    url: policySetApiBaseUrl + '/query?excludeContent=:excludeContent'
  },
  assignPolicyPriority: {
    method: 'put',
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  },
  getPrioritizedPolicy: {
    method: 'get',
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  },
  removePrioritizedAssignment: {
    method: 'delete',
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  }
}
