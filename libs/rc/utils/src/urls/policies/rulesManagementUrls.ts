import { ApiInfo } from '../../apiService'

const policySetApiBaseUrl = '/policySets'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const RulesManagementUrlsInfo: { [key: string]: ApiInfo } = {
  getAdaptivePolicySets: {
    method: 'get',
    url: policySetApiBaseUrl + paginationParams
  }
}
