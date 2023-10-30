import { ApiInfo } from '@acx-ui/utils'

export const IdentityProviderUrls: { [key: string]: ApiInfo } = {
  addIdentityProvider: {
    method: 'post',
    url: '/hotspot20IdentityProviders',
    newApi: true
  },
  updateIdentityProvider: {
    method: 'put',
    url: '/hotspot20IdentityProviders/:policyId',
    newApi: true
  },
  deleteIdentityProviderList: {
    method: 'delete',
    url: '/hotspot20IdentityProviders',
    newApi: true
  },
  getEnhancedIdentityProviderList: {
    method: 'post',
    url: '/enhancedHotspot20IdentityProviders/query',
    newApi: true
  }
}
