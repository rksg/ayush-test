import { ApiInfo } from '../apiService'

const macRegApiBaseUrl = '/api/macRegistrationPools'

export const RadiusUrlsInfo: { [key: string]: ApiInfo } = {
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
    url: macRegApiBaseUrl + '/:macRegistrationListId'
  },
  getMacRegistrationPool: {
    method: 'get',
    url: macRegApiBaseUrl + '/:macRegistrationListId'
  },
  updateMacRegistrationPool: {
    method: 'PATCH',
    url: macRegApiBaseUrl + '/:macRegistrationListId'
  },
  getMacRegistrations: {
    method: 'get',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations'
  },
  createMacRegistration: {
    method: 'post',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations'
  },
  deleteMacRegistration: {
    method: 'delete',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations/:registrationId'
  },
  getMacRegistration: {
    method: 'get',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations/:registrationId'
  },
  updateMacRegistration: {
    method: 'PATCH',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations/:registrationId'
  },
  addMacRegistration: {
    method: 'post',
    url: macRegApiBaseUrl + '/:macRegistrationListId/registrations'
  }
}
