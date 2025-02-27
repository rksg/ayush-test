import { ApiInfo } from '@acx-ui/utils'

export const IdentityProviderUrls: { [key: string]: ApiInfo } = {
  addIdentityProvider: {
    method: 'post',
    url: '/hotspot20IdentityProviders',
    opsApi: 'POST:/hotspot20IdentityProviders',
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
    opsApi: 'PUT:/hotspot20IdentityProviders/{id}',
    newApi: true
  },
  deleteIdentityProvider: {
    method: 'delete',
    url: '/hotspot20IdentityProviders/:policyId',
    opsApi: 'DELETE:/hotspot20IdentityProviders/{id}',
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
    opsApi: 'POST:/hotspot20IdentityProviders/query',
    newApi: true
  },
  getPreconfiguredIdentityProvider: {
    method: 'get',
    url: '/hotspot20IdentityProviders/preconfiguredProviders',
    newApi: true
  },
  activateIdentityProviderRadius: {
    method: 'put',
    url: '/hotspot20IdentityProviders/:providerId/radiusServerProfiles/:radiusId',
    opsApi: 'PUT:/hotspot20IdentityProviders/{id}/radiusServerProfiles/{id}',
    newApi: true
  },
  deactivateIdentityProviderRadius: {
    method: 'delete',
    url: '/hotspot20IdentityProviders/:providerId/radiusServerProfiles/:radiusId',
    opsApi: 'DELETE:/hotspot20IdentityProviders/{id}/radiusServerProfiles/{id}',
    newApi: true
  },
  activateIdentityProviderOnWifiNetwork: {
    method: 'put',
    url: '/wifiNetworks/:wifiNetworkId/hotspot20IdentityProviders/:providerId',
    opsApi: 'PUT:/wifiNetworks/{id}/hotspot20IdentityProviders/{id}',
    newApi: true
  },
  deactivateIdentityProviderOnWifiNetwork: {
    method: 'delete',
    url: '/wifiNetworks/:wifiNetworkId/hotspot20IdentityProviders/:providerId',
    opsApi: 'DELETE:/wifiNetworks/{id}/hotspot20IdentityProviders/{id}',
    newApi: true
  }
}
