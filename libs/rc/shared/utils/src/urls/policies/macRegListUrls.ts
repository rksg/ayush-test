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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteMacRegistrationPool: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
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
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  uploadMacRegistration: {
    method: 'post',
    url: newMacRegApiBaseUrl + '/:policyId/registrations/csvFile',
    newApi: true,
    defaultHeaders: {
      'Content-Type': undefined,
      'Accept': 'application/vnd.ruckus.v1.1+json'
    }
  },
  deleteAdaptivePolicySet: {
    method: 'delete',
    url: newMacRegApiBaseUrl + '/:policyId/policySets/:policySetId',
    newApi: true
  },
  updateAdaptivePolicySet: {
    method: 'put',
    url: newMacRegApiBaseUrl + '/:policyId/policySets/:policySetId',
    newApi: true
  },
  createMacRegistrationPoolWithIdentity: {
    method: 'post',
    url: '/identityGroups/:identityGroupId/macRegistrationPools',
    newApi: true,
    defaultHeaders: {
      'Content-Type': 'application/vnd.ruckus.v1+json',
      'Accept': 'application/vnd.ruckus.v1+json'
    }
  }
}
