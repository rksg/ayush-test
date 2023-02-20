import { ApiInfo } from '../../apiService'

const policySetApiBaseUrl = '/policySets'
const policyTemplateApiBaseUrl = '/policyTemplates'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getAdaptivePolicySets: {
    method: 'get',
    url: policySetApiBaseUrl + paginationParams
  },
  getAdaptivePolicySet: {
    method: 'get',
    url: policySetApiBaseUrl + '/:policyId'
  },
  createAdaptivePolicySet: {
    method: 'post',
    url: policySetApiBaseUrl
  },
  getPolicyTemplateList: {
    method: 'get',
    url: policyTemplateApiBaseUrl + paginationParams
  },
  getPolicies: {
    method: 'get',
    url: policyTemplateApiBaseUrl + '/policies' + paginationParams
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
  deletePolicySet: {
    method: 'delete',
    url: policySetApiBaseUrl + '/:policyId'
  }
}
