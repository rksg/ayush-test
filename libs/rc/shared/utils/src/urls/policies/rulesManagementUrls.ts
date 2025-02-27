import { ApiInfo } from '@acx-ui/utils'

const policySetApiBaseUrl = '/policySets'
const policyTemplateApiBaseUrl = '/policyTemplates'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getPolicyTemplateListByQuery: {
    method: 'post',
    newApi: true,
    url: policyTemplateApiBaseUrl + '/query'
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
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId',
    opsApi: 'PUT:/policySets/{id}/prioritizedPolicies/{id}'
  },
  getPrioritizedPolicy: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId'
  },
  removePrioritizedAssignment: {
    method: 'delete',
    newApi: true,
    url: policySetApiBaseUrl + '/:policySetId/prioritizedPolicies/:policyId',
    opsApi: 'DELETE:/policySets/{id}/prioritizedPolicies/{id}'
  }
}
