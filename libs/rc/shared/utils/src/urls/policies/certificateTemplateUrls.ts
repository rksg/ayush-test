import { ApiInfo } from '@acx-ui/utils'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'
export const CertificateUrls: { [key: string]: ApiInfo } = {
  getCertificateTemplates: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/query',
    opsApi: 'POST:/certificateTemplates/query'
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
    url: '/certificateAuthorities/:caId/templates',
    opsApi: 'POST:/certificateAuthorities/{id}/templates'
  },
  editCertificateTemplate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:policyId',
    opsApi: 'PATCH:/certificateTemplates/{id}'
  },
  bindCertificateTemplateWithPolicySet: {
    method: 'put',
    newApi: true,
    url: '/certificateTemplates/:templateId/policySets/:policySetId',
    opsApi: 'PUT:/certificateTemplates/{id}/policySets/{id}'
  },
  unbindCertificateTemplateWithPolicySet: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:templateId/policySets/:policySetId',
    opsApi: 'DELETE:/certificateTemplates/{id}/policySets/{id}'
  },
  deleteCertificateTemplate: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:templateId',
    opsApi: 'DELETE:/certificateTemplates/{id}'
  },
  getCertificateTemplateScepKeys: {
    method: 'get',
    newApi: true,
    url: '/certificateTemplates/:templateId/scepKeys' + paginationParams
  },
  createCertificateTemplateScepKeys: {
    method: 'post',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys',
    opsApi: 'POST:/certificateTemplates/{id}/scepKeys'
  },
  editCertificateTemplateScepKeys: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys/:scepKeysId',
    opsApi: 'PATCH:/certificateTemplates/{id}/scepKeys/{id}'
  },
  deleteCertificateTemplateScepKeys: {
    method: 'delete',
    newApi: true,
    url: '/certificateTemplates/:policyId/scepKeys/:scepKeysId',
    opsApi: 'DELETE:/certificateTemplates/{id}/scepKeys/{id}'
  },
  getCAs: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/query',
    opsApi: 'POST:/certificateAuthorities/query'
  },
  getCA: {
    method: 'get',
    newApi: true,
    url: '/certificateAuthorities/:caId'
  },
  getSubCAs: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/subCas/query',
    opsApi: 'POST:/certificateAuthorities/:caId/subCas/query'
  },
  addCA: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities',
    opsApi: 'POST:/certificateAuthorities'
  },
  addSubCA: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/subCas',
    opsApi: 'POST:/certificateAuthorities/{id}/subCas'
  },
  editCA: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateAuthorities/:caId',
    opsApi: 'PATCH:/certificateAuthorities/{id}'
  },
  uploadCAPrivateKey: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/privateKeys',
    opsApi: 'POST:/certificateAuthorities/{id}/privateKeys'
  },
  deleteCAPrivateKey: {
    method: 'delete',
    newApi: true,
    url: '/certificateAuthorities/:caId/privateKeys',
    opsApi: 'DELETE:/certificateAuthorities/{id}/privateKeys'
  },
  deleteCA: {
    method: 'delete',
    newApi: true,
    url: '/certificateAuthorities/:caId',
    opsApi: 'DELETE:/certificateAuthorities/{id}'
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
    url: '/certificateTemplates/:templateId/certificates',
    opsApi: 'POST:/certificateTemplates/{id}/certificates'
  },
  editCertificate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificateTemplates/:templateId/certificates/:certificateId',
    opsApi: 'PATCH:/certificateTemplates/{id}/certificates/{id}'
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
    url: '/certificateTemplates/:templateId/identities/:personaId/certificates',
    opsApi: 'POST:/certificateTemplates/{id}/identities/{id}/certificates'
  },
  getServerCertificates: {
    method: 'post',
    newApi: true,
    url: '/certificates/query'
  },
  updateServerCertificate: {
    method: 'PATCH',
    newApi: true,
    url: '/certificates/:certId',
    opsApi: 'PATCH:/certificates/{id}'
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
    url: '/certificates/query',
    opsApi: 'POST:/certificates/query'
  },
  activateCertificateAuthorityOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificateAuthorities/:certificateAuthorityId',
    newApi: true,
    opsApi: 'PUT:/radiusServerProfiles/{id}/certificateAuthorities/{id}'
  },
  deactivateCertificateAuthorityOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificateAuthorities/:certificateAuthorityId',
    newApi: true,
    opsApi: 'DELETE:/radiusServerProfiles/{id}/certificateAuthorities/{id}'
  },
  activateClientCertificateOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificates/:clientCertificateId?certType=CLIENT',
    newApi: true,
    opsApi: 'PUT:/radiusServerProfiles/{id}/certificates/{id}'
  },
  deactivateClientCertificateOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificates/:clientCertificateId?certType=CLIENT',
    newApi: true,
    opsApi: 'DELETE:/radiusServerProfiles/{id}/certificates/{id}'
  },
  activateServerCertificateOnRadius: {
    method: 'put',
    url: '/radiusServerProfiles/:radiusId/certificates/:serverCertificateId?certType=SERVER',
    newApi: true,
    opsApi: 'PUT:/radiusServerProfiles/{id}/certificates/{id}'
  },
  deactivateServerCertificateOnRadius: {
    method: 'delete',
    url: '/radiusServerProfiles/:radiusId/certificates/:serverCertificateId?certType=SERVER',
    newApi: true,
    opsApi: 'DELETE:/radiusServerProfiles/{id}/certificates/{id}'
  },
  generateClientServerCertificate: {
    method: 'post',
    newApi: true,
    url: '/certificateAuthorities/:caId/certificates',
    opsApi: 'POST:/certificateAuthorities/{id}/certificates'
  },
  uploadCertificate: {
    method: 'post',
    newApi: true,
    url: '/certificates',
    opsApi: 'POST:/certificates'
  }
}
