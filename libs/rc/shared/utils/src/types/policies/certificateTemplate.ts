import { Moment } from 'moment-timezone'

import { ExpirationDateEntity } from '../components/expirationDateSelector'

export enum CertificateCategoryType {
  CERTIFICATE_TEMPLATE = 'certificateTemplate',
  CERTIFICATE_AUTHORITY = 'certificateAuthority',
  CERTIFICATE = 'certificate',
  SERVER_CERTIFICATES = 'serverCertificates'
}

export enum CertificateAuthorityType {
  ONBOARD = 'ONBOARD',
  MICROSOFT = 'MICROSOFT',
  INCOMMON = 'INCOMMON',
  NETWORKFX = 'NETWORKFX',
  CUSTOM = 'CUSTOM'
}

export enum CertificateExpirationType {
  SPECIFIED_DATE = 'SPECIFIED_DATE',
  MINUTES_AFTER_TIME = 'MINUTES',
  HOURS_AFTER_TIME = 'HOURS',
  DAYS_AFTER_TIME = 'DAYS',
  WEEKS_AFTER_TIME = 'WEEKS',
  MONTHS_AFTER_TIME = 'MONTHS',
  YEARS_AFTER_TIME = 'YEARS'
}

export enum CertificateStatusType {
  VALID = 'VALID',
  INVALID = 'INVALID',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export enum AlgorithmType {
  SHA_256 = 'SHA_256',
  SHA_384 = 'SHA_384',
  SHA_512 = 'SHA_512'
}

export enum UsageType {
  CLIENT_AUTH = 'CLIENT_AUTH',
  SERVER_AUTH = 'SERVER_AUTH',
  CODE_SIGNING = 'CODE_SIGNING',
  EMAIL_PROTECTION = 'EMAIL_PROTECTION',
  IPSEC_END_SYSTEM = 'IPSEC_END_SYSTEM',
  IPSEC_TUNNEL = 'IPSEC_TUNNEL',
  IPSEC_USER = 'IPSEC_USER',
  TIME_STAMPING = 'TIME_STAMPING',
  OCSP_SIGNING = 'OCSP_SIGNING',
  SMART_CARD_LOGON = 'SMART_CARD_LOGON',
  MICROSOFT_SGC = 'MICROSOFT_SGC',
  NETSCAPE_SGC = 'NETSCAPE_SGC',
  DOCUMENT_SIGNING = 'DOCUMENT_SIGNING',
  HOTSPOT_AUTH = 'HOTSPOT_AUTH'
}

export enum KeyUsageType {
  DIGITAL_SIGNATURE = 'DIGITAL_SIGNATURE',
  KEY_ENCIPHERMENT = 'KEY_ENCIPHERMENT',
  DATA_ENCIPHERMENT = 'DATA_ENCIPHERMENT',
  KEY_CERT_SIGN = 'KEY_CERT_SIGN',
  CRL_SIGN = 'CRL_SIGN',
}

export enum KeyType {
  PUBLIC = 'publicKey',
  PRIVATE = 'privateKey',
  PASSWORD = 'password'
}

export enum GenerationCaType {
  NEW = 'NEW',
  NEW_SUB_CA = 'NEW_SUB_CA',
  UPLOAD = 'UPLOAD'
}

export enum ChromebookEnrollmentType {
  DEVICE = 'DEVICE',
  USER = 'USER'
}

export enum ChromebookCertRemovalType {
  NONE = 'NONE',
  SAME_CN = 'SAME_CN',
  SAME_CA = 'SAME_CA',
  SAME_CN_OR_SAME_CA = 'SAME_CN_OR_SAME_CA',
  ALL = 'ALL'
}

export enum ChallengePasswordType {
  STATIC = 'STATIC',
  NONE = 'NONE',
  MICROSOFT = 'MICROSOFT_INTUNE'
}

export enum ScepKeyCommonNameType {
  IGNORE = 'IGNORE',
  MAC_ADDRESS = 'MAC_ADDRESS',
  USERNAME = 'USERNAME',
  DEVICE_NAME = 'DEVICE_NAME',
  EMAIL = 'EMAIL',
  LOCATION = 'LOCATION'
}

export interface CertificateTemplate {
  id: string
  description?: string
  name: string
  caType: string
  defaultAccess?: boolean | string
  policySetId?: string
  onboard?: OnboardCA
  keyLength: number
  algorithm: AlgorithmType
  certificateCount?: number
  certificateNames?: string[]
  chromebook?: Chromebook,
  networkIds?: string[],
  variables?: string[],
  identityGroupId?: string
  networkCount?: number
}

export interface OnboardCA {
  commonNamePattern: string
  emailPattern?: string
  notAfterType: CertificateExpirationType
  notAfterDate?: string
  notAfterValue?: number
  notBeforeType: CertificateExpirationType
  notBeforeDate?: string
  notBeforeValue?: number
  organizationPattern?: string
  organizationUnitPattern?: string
  localityPattern?: string
  statePattern?: string
  countryPattern?: string
  certificateAuthorityId: string
  certificateAuthorityName?: string
}

export interface Chromebook {
  enabled: boolean
  enrollmentType?: ChromebookEnrollmentType
  notifyAppId?: string
  apiKey?: string
  certRemovalType?: ChromebookCertRemovalType
  accountCredential?: string
  type?: string
  projectId?: string
  clientEmail?: string
  privateKeyId?: string,
  enrollmentUrl?: string
}

export interface CertificateTemplateFormData extends CertificateTemplate {
  notBefore: ExpirationDateEntity
  notAfter: ExpirationDateEntity
  chromebook?: ChromebookFormData
  policySetName: string
  identityGroupName: string
}

export interface ChromebookFormData extends Chromebook {
  accountCredentialFile?: File
}

export interface CertificateAuthority {
  id: string
  name: string
  commonName: string
  organization?: string
  organizationUnit?: string
  email?: string
  startDate: string
  expireDate: string
  keyLength: number
  algorithm: AlgorithmType
  title?: string
  locality?: string
  state?: string
  country?: string
  publicKeyBase64?: string
  privateKeyBase64?: string
  publicKeyShaThumbprint?: string
  serialNumber?: string
  ocspUrl?: string
  parentCaId?: string
  usages?: UsageType[]
  templateCount?: number
  templateNames?: string[]
  ocspName?: string
  ocspHash?: string
  keyUsages?: KeyUsageType[]
  chain?: string
  details?: string
  description?: string,
  status: CertificateStatusType[]
}

export interface CertificateAuthorityFormData extends CertificateAuthority {
  generation: GenerationCaType
  password: string
  startDateMoment: Moment
  expireDateMoment: Moment
}

export interface Certificate {
  id: string
  commonName: string
  createDate: string
  notBeforeDate: string
  notAfterDate: string
  email?: string
  revocationDate?: string
  revocationReason?: string
  serialNumber?: string
  publicKeyBase64?: string
  organization?: string
  keyLength?: number
  certificateTemplateId?: string
  certificateTemplateName?: string
  certificateAuthoritiesId?: string
  certificateAuthoritiesName?: string
  locality?: string
  state?: string
  country?: string
  organizationUnit?: string
  keyUsages?: KeyUsageType[]
  privateKeyBase64?: string
  shaThumbprint?: string
  chain?: string
  details?: string
  description?: string
  enrollmentType?: EnrollmentType
  identityId?: string
  identityName?: string
  identityGroupId?: string
  status?: CertificateStatusType[]
}

export interface CertificateFormData {
  csrString?: string
  userName: string
  description?: string
  certificateTemplateId: string
  csrType: string
  identityId: string
}

export interface ScepKeyData {
  id: string
  name: string
  enrollmentUrl: string
  allowedSubnets?: string
  blockedSubnets?: string
  expirationDate: string
  challengePassword?: string
  challengePasswordType: ChallengePasswordType
  cnValue1: string
  cnValue2: string
  cnValue3: string
  intuneTenantId?: string
  azureApplicationId?: string
  azureApplicationKey?: string
  overrideDays: number
  scepKey: string
}

export type CertificateTemplateMutationResult = {
  requestId: string
  id?: string
}

export enum CertificateAcceptType {
  PEM = 'application/x-pem-file',
  DER = 'application/x-x509-ca-cert',
  PKCS7 = 'application/x-pkcs7-certificates',
  PKCS8 = 'application/pkcs8',
  PKCS12 = 'application/x-pkcs12',
  PKCS1 = 'application/pkcs1'
}

export enum EnrollmentType {
  NONE = 'NONE',
  CHROMEBOOK = 'CHROMEBOOK',
  SCEP = 'SCEP'
}

export interface ServerCertificate extends Certificate{
  name: string
  status: CertificateStatusType[]
  title?: string
  algorithm?: ServerClientCertAlgorithmType
  csrString?: string
  extendedKeyUsages?: [ExtendedKeyUsages]
}

export const serverCertStatusColors = {
  [CertificateStatusType.VALID]: '--acx-semantics-green-50',
  [CertificateStatusType.INVALID]: '--acx-neutrals-60',
  [CertificateStatusType.REVOKED]: '--acx-neutrals-20',
  [CertificateStatusType.EXPIRED]: '--acx-semantics-red-50'
}

export enum CertificateGenerationType {
  NEW = 'NEW',
  WITH_CSR = 'WITH_CSR',
  UPLOAD = 'UPLOAD'
}

export interface GenerateCertificateFormData extends ServerCertificate {
  generation: CertificateGenerationType
  password: string
  startDateMoment: Moment
  expireDateMoment: Moment
}

export enum KeyUsages {
  DIGITAL_SIGNATURE = 'DIGITAL_SIGNATURE',
  KEY_ENCIPHERMENT = 'KEY_ENCIPHERMENT'
}

export enum ExtendedKeyUsages {
  SERVER_AUTH = 'SERVER_AUTH',
  CLIENT_AUTH = 'CLIENT_AUTH'
}

export enum ServerClientCertAlgorithmType {
  SHA_1 = 'SHA_1',
  SHA_256 = 'SHA_256',
  SHA_384 = 'SHA_384',
  SHA_512 = 'SHA_512'
}

export type ServerClientCertificateResult = {
  requestId: string
  id?: string
}

export enum ServerClientCertType {
  PUBLIC = 'publicKey',
  PRIVATE = 'privateKey'
}
