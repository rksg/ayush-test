import { ApiInfo } from '@acx-ui/utils'

const policySetApiBaseUrl = '/policySets'
const policyTemplateApiBaseUrl = '/policyTemplates'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getPolicyTemplateList: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + paginationParams
  },
  getPolicies: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/policies' + paginationParams
  },
  getPoliciesByQuery: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/policies/query?excludeContent=:excludeContent'
  },
  getPolicyTemplateAttributes: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/attributes' + paginationParams
  },
  getPoliciesByTemplate: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId' + paginationParams
  },
  getPolicyByTemplate: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  getConditionsInPolicy: {
    method: 'get',
    newApi: true,
    // eslint-disable-next-line max-len
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions?size=:pageSize&page=:page'
  },
  addConditions: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions'
  },
  updateConditions: {
    method: 'PATCH',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions/:conditionId'
  },
  deleteConditions: {
    method: 'delete',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions/:conditionId'
  },
  createPolicy: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies'
  },
  updatePolicy: {
    method: 'PATCH',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  deletePolicy: {
    method: 'delete',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId'
  },
  getPolicySets: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + paginationParams
  },
  getPolicySet: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId'
  },
  createPolicySet: {
    method: 'post',
    newApi: true,
    url: policySetApiBaseUrl
  },
  deletePolicySet: {
    method: 'delete',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId'
  },
  updatePolicySet: {
    method: 'PATCH',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId'
  },
  getPrioritizedPolicies: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies'
  },
  getPolicySetsByQuery: {
    method: 'post',
    newApi: true,
    url: policySetApiBaseUrl + '/query?excludeContent=:excludeContent'
  },
  assignPolicyPriority: {
    method: 'put',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  },
  getPrioritizedPolicy: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  },
  removePrioritizedAssignment: {
    method: 'delete',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  }
}
