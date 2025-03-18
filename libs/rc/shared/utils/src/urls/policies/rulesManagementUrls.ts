import { ApiInfo } from '@acx-ui/utils'

const policySetApiBaseUrl = '/policySets'
const policyTemplateApiBaseUrl = '/policyTemplates'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getPolicyTemplateListByQuery: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/query',
    opsApi: 'POST:/policyTemplates/query'
  },
  getPolicies: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/policies' + paginationParams,
    opsApi: 'GET:/policyTemplates/policies'
  },
  getPoliciesByQuery: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/policies/query?excludeContent=:excludeContent',
    opsApi: 'POST:/policyTemplates/policies/query'
  },
  getPolicyTemplateAttributes: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/attributes' + paginationParams,
    opsApi: 'GET:/policyTemplates/{id}/attributes'
  },
  getPoliciesByTemplate: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId' + paginationParams,
    opsApi: 'GET:/policyTemplates/{id}'
  },
  getPolicyByTemplate: {
    method: 'get',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId',
    opsApi: 'GET:/policyTemplates/{id}/policies/{id}'
  },
  getConditionsInPolicy: {
    method: 'get',
    newApi: true,
    // eslint-disable-next-line max-len
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions?size=:pageSize&page=:page',
    opsApi: 'GET:/policyTemplates/{id}/policies/{id}/conditions'
  },
  addConditions: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions',
    opsApi: 'POST:/policyTemplates/{id}/policies/{id}/conditions'
  },
  updateConditions: {
    method: 'PATCH',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions/:conditionId',
    opsApi: 'PATCH:/policyTemplates/{id}/policies/{id}/conditions/{id}'
  },
  deleteConditions: {
    method: 'delete',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId/conditions/:conditionId',
    opsApi: 'DELETE:/policyTemplates/{id}/policies/{id}/conditions/{id}'
  },
  createPolicy: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies',
    opsApi: 'POST:/policyTemplates/{id}/policies'
  },
  updatePolicy: {
    method: 'PATCH',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId',
    opsApi: 'PATCH:/policyTemplates/{id}/policies/{id}'
  },
  deletePolicy: {
    method: 'delete',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/:templateId/policies/:policyId',
    opsApi: 'DELETE:/policyTemplates/{id}/policies/{id}'
  },
  getPolicySets: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + paginationParams,
    opsApi: 'GET:/policySets'
  },
  getPolicySet: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId',
    opsApi: 'GET:/policySets/{id}'
  },
  createPolicySet: {
    method: 'post',
    newApi: true,
    url: policySetApiBaseUrl,
    opsApi: 'POST:/policySets'
  },
  deletePolicySet: {
    method: 'delete',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId',
    opsApi: 'DELETE:/policySets/{id}'
  },
  updatePolicySet: {
    method: 'PATCH',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId',
    opsApi: 'PATCH:/policySets/{id}'
  },
  getPrioritizedPolicies: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies',
    opsApi: 'GET:/policySets/{id}/prioritizedPolicies'
  },
  getPolicySetsByQuery: {
    method: 'post',
    newApi: true,
    url: policySetApiBaseUrl + '/query?excludeContent=:excludeContent',
    opsApi: 'POST:/policySets/query'
  },
  assignPolicyPriority: {
    method: 'put',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId',
    opsApi: 'PUT:/policySets/{id}/prioritizedPolicies/{id}'
  },
  getPrioritizedPolicy: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId',
    opsApi: 'GET:/policySets/{id}/prioritizedPolicies/{id}'
  },
  removePrioritizedAssignment: {
    method: 'delete',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId',
    opsApi: 'DELETE:/policySets/{id}/prioritizedPolicies/{id}'
  }
}
