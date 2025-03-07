import { ApiInfo } from '@acx-ui/utils'

const macRegApiBaseUrl = '/api/macRegistrationPools'

const newMacRegApiBaseUrl = '/macRegistrationPools'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

export const MacRegListUrlsInfo: { [key: string]: ApiInfo } = {
  getMacRegistrationPools: {
    method: 'get',
    url: newMacRegApiBaseUrl + paginationParams,
    oldUrl: macRegApiBaseUrl + paginationParams,
    newApi: true,
    opsApi: 'GET:/macRegistrationPools'
  },
  searchMacRegistrationPools: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/query' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/query' + paginationParams,
    newApi: true,
    opsApi: 'POST:/macRegistrationPools/query'
  },
  createMacRegistrationPool: {
    method: 'post',
    url: newMacRegApiBaseUrl,
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'POST:/macRegistrationPools'
  },
  deleteMacRegistrationPool: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'DELETE:/macRegistrationPools/{id}'
  },
  getMacRegistrationPool: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId',
    oldUrl: macRegApiBaseUrl + '/:policyId',
    newApi: true,
    opsApi: 'GET:/macRegistrationPools/{id}'
  },
  updateMacRegistrationPool: {
    method: 'PATCH',
    url: newMacRegApiBaseUrl + '/:policyId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'PATCH:/macRegistrationPools/{id}'
  },
  getMacRegistrations: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId/registrations' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations' + paginationParams,
    newApi: true,
    opsApi: 'GET:/macRegistrationPools/{id}/registrations'
  },
  searchMacRegistrations: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/query' + paginationParams,
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/query' + paginationParams,
    newApi: true,
    opsApi: 'POST:/macRegistrationPools/{id}/registrations/query'
  },
  createMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations',
    newApi: true,
    opsApi: 'POST:/macRegistrationPools/{id}/registrations'
  },
  deleteMacRegistration: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true,
    opsApi: 'DELETE:/macRegistrationPools/{id}/registrations/{id}'
  },
  deleteMacRegistrations: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'DELETE:/macRegistrationPools/{id}/registrations'
  },
  getMacRegistration: {
    method: 'get',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true,
    opsApi: 'GET:/macRegistrationPools/{id}/registrations/{id}'
  },
  updateMacRegistration: {
    method: 'PATCH',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    oldUrl: macRegApiBaseUrl + '/:policyId/registrations/:registrationId',
    newApi: true,
    opsApi: 'PATCH:/macRegistrationPools/{id}/registrations/{id}'
  },
  addMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'POST:/macRegistrationPools/{id}/registrations'
  },
  uploadMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/csvFile',
    newApi: true,
    defaultHeaders: {
      'Content-Type': undefined,
      'Accept': 'application/vnd.ruckus.v1.1+json'
    },
    opsApi: 'POST:/macRegistrationPools/{id}/registrations/csvFile'
  },
  deleteAdaptivePolicySet: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/policySets/:policySetId',
    newApi: true,
    opsApi: 'DELETE:/macRegistrationPools/{id}/policySets/{id}'
  },
  updateAdaptivePolicySet: {
    method: 'put',
    url: newMacRegApiBaseUrl + '/:policyId/policySets/:policySetId',
    newApi: true,
    opsApi: 'PUT:/macRegistrationPools/{id}/policySets/{id}'
  },
  createMacRegistrationPoolWithIdentity: {
    method: 'post',
    url: '/identityGroups/:identityGroupId/macRegistrationPools',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/identityGroups/{id}/macRegistrationPools'
  }
}
