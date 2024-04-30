import { ApiInfo } from '@acx-ui/utils'

export const CertificateUrls: { [key: string]: ApiInfo } = {
  getCertificateTemplates: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/query'
  },
  getCertificateTemplate: {
    method: 'get',
    newApi: true,
    url: '/certificateTemplates/:policyId'
  },
  getCertificatesByTemplate: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates/query'
  },
  addCertificateTemplate: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/templates'
  },
  editCertificateTemplate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:policyId'
  },
  deleteCertificateTemplate: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:templateId'
  },
  getCAs: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/query'
  },
  getCA: {
    method: 'get',
    newApi: true,
    url: '/certificateAuthorities/:caId'
  },
  getSubCAs: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/subCas/query'
  },
  addCA: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities'
  },
  addSubCA: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/subCas'
  },
  editCA: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateAuthorities/:caId'
  },
  uploadCAPrivateKey: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/privateKeys'
  },
  deleteCAPrivateKey: {
    method: 'delete',
    newApi: true,
    url: '/certificateAuthorities/:caId/privateKeys'
  },
  deleteCA: {
    method: 'delete',
    newApi: true,
    url: '/certificateAuthorities/:caId'
  },
  downloadCA: {
    method: 'get',
    newApi: true,
    url: '/certificateAuthorities/:caId?includeChain=:includeChain&password=:password'
  },
  downloadCAChains: {
    method: 'get',
    newApi: true,
    url: '/certificateAuthorities/:caId/chains'
  },
  getCertificates: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/certificates/query'
  },
  getSpecificTemplateCertificates: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates/query'
  },
  generateCertificate: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates'
  },
  editCertificate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates/:certificateId'
  },
  downloadCertificate: {
    method: 'get',
    newApi: true,
    // eslint-disable-next-line max-len
    url: '/certificateTemplates/:templateId/certificates/:certificateId?includeChain=:includeChain&password=:password'
  },
  downloadCertificateChains: {
    method: 'get',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates/:certificateId/chains'
  }
}