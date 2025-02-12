import { ApiInfo } from '@acx-ui/utils'

export const IdentityProviderProfileUrls: { [key: string]: ApiInfo } = {
  createIdentityProviderProfile: {
    method: 'post',
    url: '/identityProviderProfiles',
    opsApi: 'POST:/identityProviderProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getIdentityProviderProfileViewDataList: {
    method: 'post',
    url: '/identityProviderProfiles/query',
    opsApi: 'POST:/identityProviderProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteIdentityProviderProfile: {
    method: 'delete',
    url: '/identityProviderProfiles/:id',
    opsApi: 'DELETE:/identityProviderProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getIdentityProviderProfile: {
    method: 'get',
    url: '/identityProviderProfiles/:id',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateIdentityProviderProfile: {
    method: 'put',
    url: '/identityProviderProfiles/:id',
    opsApi: 'PUT:/identityProviderProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}