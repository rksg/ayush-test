import { ApiInfo } from '@acx-ui/utils'

export const IdentityProviderUrls: { [key: string]: ApiInfo } = {
  addIdentityProvider: {
    method: 'post',
    url: '/hotspot20IdentityProviders',
    newApi: true
  },
  getIdentityProvider: {
    method: 'get',
    url: '/hotspot20IdentityProviders/:policyId',
    newApi: true
  },
  updateIdentityProvider: {
    method: 'put',
    url: '/hotspot20IdentityProviders/:policyId',
    newApi: true
  },
  deleteIdentityProvider: {
    method: 'delete',
    url: '/hotspot20IdentityProviders/:policyId',
    newApi: true
  },
  /*
  deleteIdentityProviderList: {
    method: 'delete',
    url: '/hotspot20IdentityProviders',
    newApi: true
  },
  */
  getIdentityProviderList: {
    method: 'post',
    url: '/hotspot20IdentityProviders/query',
    newApi: true
  }
}
