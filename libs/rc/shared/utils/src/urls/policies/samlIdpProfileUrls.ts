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
  activateEncryptionCertificate: {
    method: 'put',
    url: '/samlIdpProfiles/:id/encryptionCertificates/:certificateId',
    opsApi: 'PUT:/samlIdpProfiles/{id}/encryptionCertificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateEncryptionCertificate: {
    method: 'delete',
    url: '/samlIdpProfiles/:id/encryptionCertificates/:certificateId',
    opsApi: 'DELETE:/samlIdpProfiles/{id}/encryptionCertificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  activateSigningCertificate: {
    method: 'put',
    url: '/samlIdpProfiles/:id/signingCertificates/:certificateId',
    opsApi: 'PUT:/samlIdpProfiles/{id}/signingCertificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deactivateSigningCertificate: {
    method: 'delete',
    url: '/samlIdpProfiles/:id/signingCertificates/:certificateId',
    opsApi: 'DELETE:/samlIdpProfiles/{id}/signingCertificates/{id}',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  downloadSamlServiceProviderMetadata: {
    method: 'get',
    url: '/samlIdpProfiles/:id/serviceProviderMetadata',
    opsApi: 'GET:/samlIdpProfiles/{id}/serviceProviderMetadata',
    newApi: true,
    defaultHeaders: {
      Accept: 'text/xml'
    }
  },
  activateIdentityProviderProfileOnNetwork: {
    method: 'put',
    url: '/wifiNetworks/:wifiNetworkId/samlIdpProfiles/:samlIdpProfileId',
    opsApi: 'PUT:/wifiNetworks/:wifiNetworkId/samlIdpProfiles/:samlIdpProfileId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
