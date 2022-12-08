import { ApiInfo } from '../../apiService'

const macRegApiBaseUrl = '/api/macRegistrationPools'

export const MacRegListUrlsInfo: { [key: string]: ApiInfo } = {
  getMacRegistrationPools: {
    method: 'get',
    url: macRegApiBaseUrl
  },
  createMacRegistrationPool: {
    method: 'post',
    url: macRegApiBaseUrl
  },
  deleteMacRegistrationPool: {
    method: 'delete',
    url: macRegApiBaseUrl + '/:policyId'
  },
  getMacRegistrationPool: {
    method: 'get',
    url: macRegApiBaseUrl + '/:policyId'
  },
  updateMacRegistrationPool: {
    method: 'PATCH',
    url: macRegApiBaseUrl + '/:policyId'
  },
  getMacRegistrations: {
    method: 'get',
    url: macRegApiBaseUrl + '/:policyId/registrations'
  },
  createMacRegistration: {
    method: 'post',
    url: macRegApiBaseUrl + '/:policyId/registrations'
  },
  deleteMacRegistration: {
    method: 'delete',
    url: macRegApiBaseUrl + '/:policyId/registrations/:registrationId'
  },
  getMacRegistration: {
    method: 'get',
    url: macRegApiBaseUrl + '/:policyId/registrations/:registrationId'
  },
  updateMacRegistration: {
    method: 'PATCH',
    url: macRegApiBaseUrl + '/:policyId/registrations/:registrationId'
  },
  addMacRegistration: {
    method: 'post',
    url: macRegApiBaseUrl + '/:policyId/registrations'
  }
}
