import { ApiInfo } from '@acx-ui/utils'

enum CertificateType {
  CLIENT = 'CLIENT',
  SERVER = 'SERVER'
}

export const AaaUrls: { [key: string]: ApiInfo } = {
  deleteAAAPolicyList: {
    method: 'delete',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/',
    url: '/radiusServerProfiles',
    newApi: true
  },
  addAAAPolicy: {
    method: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    url: '/radiusServerProfiles',
    newApi: true
  },
  getAAAPolicy: {
    method: 'get',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true
  },
  updateAAAPolicy: {
    method: 'put',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true
  },
  getAAAPolicyViewModelList: {
    method: 'post',
    oldUrl: '/api/viewmodel/tenant/:tenantId/enhancedRadiusServerProfiles/query',
    url: '/enhancedRadiusServerProfiles/query',
    newApi: true
  },
  queryAAAPolicyList: {
    method: 'post',
    url: '/radiusServerProfiles/query',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteAAAPolicy: {
    method: 'delete',
    url: '/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getAAAPolicyRbac: {
    method: 'get',
    url: '/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      Accept: 'application/vnd.ruckus.v1.1+json'
    }
  },
  addAAAPolicyRbac: {
    method: 'post',
    oldUrl: '/api/tenant/:tenantId/wifi/radius',
    url: '/radiusServerProfiles',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  updateAAAPolicyRbac: {
    method: 'put',
    oldUrl: '/api/tenant/:tenantId/wifi/radius/:policyId',
    url: '/radiusServerProfiles/:policyId',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1.1+json',
      'Content-Type': 'application/vnd.ruckus.v1.1+json'
    }
  },
  getCertificateAuthorityOnRadius: {
    method: 'get',
    url: '/radiusProfiles/:policyId/certificateAuthorities',
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getClientCertificateOnRadius: {
    method: 'get',
    url: `/radiusProfiles/:policyId/certificates?certType=${CertificateType.CLIENT}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getServerCertificateOnRadius: {
    method: 'get',
    url: `/radiusProfiles/:policyId/certificates?certType=${CertificateType.SERVER}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  }
}
