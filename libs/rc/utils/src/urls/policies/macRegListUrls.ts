import { ApiInfo } from '@acx-ui/utils'

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
  searchMacRegistrationPools: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/query' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/query' + paginationParams,
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
  searchMacRegistrations: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/query' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/query' + paginationParams,
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
  deleteMacRegistrations: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations',
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
  },
  uploadMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/csvFile',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/csvFile',
    newApi: true
  }
}
