import { ApiInfo } from '../../apiService'

const policySetApiBaseUrl = '/policySets'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getAdaptivePolicySets: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + paginationParams
  },
  getAdaptivePolicySet: {
    method: 'get',
    newApi: true,
    url: policySetApiBaseUrl + '/:policyId'
  }
}
