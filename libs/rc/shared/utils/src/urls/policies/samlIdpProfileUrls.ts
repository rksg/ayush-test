import { ApiInfo } from '@acx-ui/utils'

export const SamlIdpProfileUrls: { [key: string]: ApiInfo } = {
  createSamlIdpProfile: {
    method: 'post',
    url: '/samlIdpProfiles',
    opsApi: 'POST:/samlIdpProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getSamlIdpProfileViewDataList: {
    method: 'post',
    url: '/samlIdpProfiles/query',
    opsApi: 'POST:/samlIdpProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSamlIdpProfile: {
    method: 'delete',
    url: '/samlIdpProfiles/:id',
    opsApi: 'DELETE:/samlIdpProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  getSamlIdpProfile: {
    method: 'get',
    url: '/samlIdpProfiles/:id',
    opsApi: 'GET:/samlIdpProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1+json'
    }
  },
  updateSamlIdpProfile: {
    method: 'put',
    url: '/samlIdpProfiles/:id',
    opsApi: 'PUT:/samlIdpProfiles/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateSamlIdpProfileCertificate: {
    method: 'put',
    url: '/samlIdpProfiles/:id/certificates/:certificateId',
    opsApi: 'PUT:/samlIdpProfiles/{id}/certificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateSamlIdpProfileCertificate: {
    method: 'delete',
    url: '/samlIdpProfiles/:id/certificates/:certificateId',
    opsApi: 'DELETE:/samlIdpProfiles/{id}/certificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}