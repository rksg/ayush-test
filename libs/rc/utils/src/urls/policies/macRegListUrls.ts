import { ApiInfo } from '../../apiService'

const macRegApiBaseUrl = '/api/macRegistrationPools'

const newMacRegApiBaseUrl = '/macRegistrationPools'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const MacRegListUrlsInfo: { [key: string]: ApiInfo } = {
  getMacRegistrationPools: {
    method: 'get',
    url: newMacRegApiBaseUrl + paginationParams,
    oldUrl: macRegApiBaseUrl + paginationParams,
    newApi: true
  },
  createMacRegistrationPool: {
    method: 'post',
    url: newMacRegApiBaseUrl,
    oldUrl: macRegApiBaseUrl,
    newApi: true
  },
  deleteMacRegistrationPool: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId',
    oldUrl: macRegApiBaseUrl + '/:policyId',
    newApi: true
  },
  getMacRegistrationPool: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId',
    oldUrl: macRegApiBaseUrl + '/:policyId',
    newApi: true
  },
  updateMacRegistrationPool: {
    method: 'PATCH',
    url: newMacRegApiBaseUrl + '/:policyId',
    oldUrl: macRegApiBaseUrl + '/:policyId',
    newApi: true
  },
  getMacRegistrations: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId/registrations' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations' + paginationParams,
    newApi: true
  },
  createMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations',
    newApi: true
  },
  deleteMacRegistration: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true
  },
  getMacRegistration: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true
  },
  updateMacRegistration: {
    method: 'PATCH',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true
  },
  addMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations',
    newApi: true
  }
}
