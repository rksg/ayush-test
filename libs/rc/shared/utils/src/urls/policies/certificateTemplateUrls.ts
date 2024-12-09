import { ApiInfo } from '@acx-ui/utils'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'
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
  bindCertificateTemplateWithPolicySet: {
    method: 'put',
    newApi: true,
    url: '/certificateTemplates/:templateId/policySets/:policySetId'
  },
  unbindCertificateTemplateWithPolicySet: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:templateId/policySets/:policySetId'
  },
  deleteCertificateTemplate: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:templateId'
  },
  getCertificateTemplateScepKeys: {
    method: 'get',
    newApi: true,
    url: '/certificateTemplates/:templateId/scepKeys' + paginationParams
  },
  createCertificateTemplateScepKeys: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys'
  },
  editCertificateTemplateScepKeys: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys/:scepKeysId'
  },
  deleteCertificateTemplateScepKeys: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys/:scepKeysId'
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
  },
  downloadCertificateWithPost: {
    method: 'post',
    newApi: true,
    // eslint-disable-next-line max-len
    url: '/certificateTemplates/:templateId/certificates/:certificateId'
  },
  downloadCertificateInP12: {
    method: 'post',
    newApi: true,
    // eslint-disable-next-line max-len
    url: '/certificateTemplates/:templateId/certificates/:certificateId'
  },
  getCertificatesByIdentity: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:templateId/identities/:personaId/certificates/query'
  },
  generateCertificatesToIdentity: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:templateId/identities/:personaId/certificates'
  },
  getServerCertificates: {
    method: 'post',
    newApi: true,
    url: '/certificates/query'
  },
  updateServerCertificate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificates/:certId'
  },
  downloadServerCertificate: {
    method: 'get',
    newApi: true,
    url: '/certificates/:certId'
  },
  downloadServerCertificateChains: {
    method: 'get',
    newApi: true,
    url: '/certificates/:certId/chains'
  },
  getCertificateList: {
    method: 'post',
    newApi: true,
    url: '/certificates/query'
  },
  activateCertificateAuthorityOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificateAuthorities/:certificateAuthorityId',
    newApi: true
  },
  deactivateCertificateAuthorityOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificateAuthorities/:certificateAuthorityId',
    newApi: true
  },
  activateClientCertificateOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificates/:clientCertificateId?certType=CLIENT',
    newApi: true
  },
  deactivateClientCertificateOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificates/:clientCertificateId?certType=CLIENT',
    newApi: true
  },
  activateServerCertificateOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificates/:serverCertificateId?certType=SERVER',
    newApi: true
  },
  deactivateServerCertificateOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificates/:serverCertificateId?certType=SERVER',
    newApi: true
  },
  generateClientServerCertificate: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/certificates'
  },
  uploadCertificate: {
    method: 'post',
    newApi: true,
    url: '/certificates'
  }
}
