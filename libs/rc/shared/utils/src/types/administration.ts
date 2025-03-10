import { TreeDataNode } from 'antd'

import { RolesEnum }   from '@acx-ui/types'
import { AccountTier } from '@acx-ui/utils'

import {
  EntitlementDeviceType,
  EntitlementDeviceSubType
} from './msp'

export enum TenantDelegationStatus {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  REVOKED = 'REVOKED'
}

export enum TenantDelegationType {
  VAR = 'VAR',
  SUPPORT = 'SUPPORT',
  MSP = 'MSP',
  SUPPORT_EC = 'SUPPORT_EC',
  MSP_INSTALLER = 'MSP_INSTALLER',
  MSP_INTEGRATOR = 'MSP_INTEGRATOR',
  UNKNOWN = 'UNKNOWN'
}

export enum NotificationEndpointType {
  email = 'EMAIL',
  sms = 'SMS',
  mobile_push = 'MOBILE_PUSH'
}

export enum TenantAuthenticationType {
  idm = 'IDM',
  saml = 'SAML',
  oauth2_client = 'OAUTH2_CLIENT_CREDENTIALS',
  oauth2_oidc = 'OAUTH2_OIDC',
  ldap = 'LDAP',
  google_workspace = 'GOOGLE_WORKSPACE'
}

export enum SamlFileType {
  direct_url = 'DIRECT_URL',
  file = 'FILE'
}

export enum ApplicationAuthenticationStatus {
  REVOKED = 'REVOKED',
  ACTIVE = 'ACTIVE'
}

export interface TenantDelegation {
  id: string
  type: TenantDelegationType
  status: TenantDelegationStatus
  delegatedTo: string
  delegatedBy: string
  delegatedToName: string
  expiryDate: string
  createdDate: string
}

export interface TenantDelegationResponse {
  isAccessSupported: boolean
  expiryDate: string
  createdDate: string
}

export interface RecoveryPassphrase {
  passphrase: string
}

export interface TenantPreferenceSettingValue {
  [key: string]: unknown;
}

export interface TenantPreferenceSettings {
  global?: TenantPreferenceSettingValue;
  edgeBeta?: TenantPreferenceSettingValue;
}

export interface Administrator {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: RolesEnum;
  newEmail: string;
  detailLevel?: string;
  roleDsc?: string;
  fullName?: string;
  authenticationId?: string;
  phoneNumber?: string;
}

export interface TenantMspEc {
  parentMspId?: string;
  serviceEffectiveDate: string;
  serviceExpirationDate: string;
}

export interface NotificationPreference {
  DEVICE_AP_FIRMWARE?: boolean;
  DEVICE_SWITCH_FIRMWARE?: boolean;
  DEVICE_EDGE_FIRMWARE?: boolean;
  API_CHANGES?: boolean;
}

export interface TenantDetails {
  createdDate: string;
  entitlementId: string;
  externalId: string;
  id: string;
  isActivated: boolean;
  maintenanceState: boolean;
  mspEc?: TenantMspEc;
  name: string;
  ruckusUser: boolean;
  status: string;
  tenantType: string;
  updatedDate: string;
  upgradeGroup: string;
  preferences?: string;
  tenantMFA?: {
    mfaStatus: string
  }
  accountTier?: AccountTier;
  subscribes?: string;
  extendedTrial?: boolean;
}

export enum AdministrationDelegationType {
  VAR = 'VAR',
  SUPPORT = 'SUPPORT'
}

export enum AdministrationDelegationStatus {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  REVOKED = 'REVOKED'
}

export interface Delegation {
  id: string;
  createdDate: string;
  updateDate: string;
  delegatedTo: string;
  delegatedToAdmin?: string;
  delegatedToName: string;
  type: AdministrationDelegationType;
  status: AdministrationDelegationStatus;
  statusLabel?: string;
  delegatedBy: string;
  valid: boolean;
}

export interface VARTenantDetail {
  externalId: string;
  name: string;
  updateDate: string;
  externalModifiedDate: string;
  streetAddress: string;
  stateOrProvince: string;
  country: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  faxNumber: string;
  var: boolean;
  eda: boolean;
}

export interface RegisteredUserSelectOption {
  externalId: string;
  email: string;
}

export enum NotificationRecipientType {
  GLOBAL = 'GLOBAL',
  PRIVILEGEGROUP = 'PRIVILEGEGROUP'
}

export interface NotificationRecipientUIModel {
  id: string;
  description: string;
  recipientType: NotificationRecipientType;
  emailPreferences?: boolean;
  smsPreferences?: boolean,
  privilegeGroup?: string;
  endpoints: NotificationEndpoint[];
  email: string;
  emailEnabled: boolean;
  mobile: string;
  mobileEnabled: boolean;
}

export interface NotificationEndpoint {
  id: string;
  active: boolean;
  destination: string;
  status: string;
  type: NotificationEndpointType;
  createdDate: string;
  updatedDate: string;
}

export interface NotificationRecipientResponse {
  id: string;
  description: string;
  emailPreferences?: boolean;
  smsPreferences?: boolean,
  privilegeGroupId?: string;
  endpoints: NotificationEndpoint[];
  createdDate: string;
  updatedDate: string;
}

export interface TenantAuthentications {
  id?: string;
  name: string;
  authenticationType: string;
  clientID?: string;
  clientIDStatus?: string;
  clientSecret?: string;
  tokenURL?: string;
  samlFileType?: string;
  samlFileURL?: string;
  authorizationURL?: string;
  tenant?: string;
  url?: string;
  scopes?: string;
  domains?: string[];
  samlSignatureEnabled?: boolean;
  samlEncryptionCertificateId?: string;
}

export interface Entitlement {
  id: string;
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  effectiveDate: string;
  expirationDate: string;
  quantity: number;
  status?: string;
  sku: string;
  tempLicense: boolean;
  historical: boolean;
  graceEndDate: string;
  inactiveRow?: boolean;
  timeLeft?: number;
  isExpired?: boolean;
  isGracePeriod?: boolean;
  typeLiteral?: string;
  createdDate: string;
  updatedDate: string;
  assignedLicense?: boolean;
}

export interface EntitlementSummary {
  deviceType: EntitlementDeviceType;
  deviceSubType?: EntitlementDeviceSubType;
  quantity: number;
  remainingDevices: number;
  effectiveDate: string;
  expirationDate: string;
  entitlementId?: string;
  errorCode?: unknown;
  internalMessage?: unknown;
  remainingDays?: number;
  deviceCount: number;
}

export interface NewEntitlementSummary {
  banners: Array<unknown>;
  entitlements: Entitlement[];
  summary: EntitlementSummary[];
}

export interface EntitlementPendingActivations {
  data: EntitlementActivations[],
}

export interface EntitlementActivations {
  orderId: string,
  salesOrderId: string,
  productName: string,
  productCode: string,
  productId: string,
  quantity: number,
  registeredQuantity: number,
  remainingQuantity: number,
  spaStartDate: string,
  spaEndDate: string,
  productCategory: string,
  productClass: string,
  orderSoNumber: string,
  orderCreateDate: string,
  orderRegistrationCode: string,
  orderAcxRegistrationCode:string,
  isChild?: boolean,
  trial?: boolean
}

export type EntitlementDeviceTypes = Array<{ label: string, value: EntitlementDeviceType }>

export interface AdminGroup {
  id?: string,
  name?: string,
  groupId?: string,
  role?: RolesEnum,
  customRole?: CustomRole,
  loggedInMembers?: number,
  processingPriority?: number,
  swapPriority?: boolean,
  sourceGroupId?: string
}

export interface CustomRole {
  id?: string,
  name?: RolesEnum,
  description?: string,
  type?: string,
  frameworkRO?: boolean,
  createdDate?: string,
  updatedDate?: string,
  scopes?: string[],
  features?: string[],
  preDefinedRole?: string
}

export interface AdminGroupLastLogins {
  count?: number,
  lastLoginList?: groupMembers[]
}

export interface groupMembers {
  email?: string,
  lastLoginDate?: string
}

export interface PgAdmin {
  id?: string;
  externalId?: string;
  email?: string;
  name?: string;
  lastName?: string;
  detailLevel?: string;
  delegateToAllECs?: boolean;
}

export interface PrivilegeGroup {
  id: string,
  name?: string,
  type?: string,
  description?: string,
  role?: CustomRole,
  roleName?: string,
  scope?: string,
  memberCount?: number,
  allCustomers?: boolean,
  allVenues?: boolean,
  delegation?: boolean,
  policies?: PrivilegePolicy[],
  policyEntityDTOS?: PrivilegePolicyEntity[],
  admins?: PgAdmin[],
  parentPrivilegeGroupId?: string
}

export enum PrivilegePolicyObjectType {
  OBJ_TYPE_VENUE = 'com.ruckus.cloud.venue.model.venue'
}

export enum CustomGroupType {
  SYSTEM = 'System',
  CUSTOM = 'Custom'
}

export interface PrivilegePolicy
{
  entityInstanceId?: string,
  objectType?: string
}

export interface PrivilegePolicyEntity
{
  tenantId?: string,
  objectList?: VenueObjectList,
  allVenues?: boolean
}

export interface VenueObjectList
{
  'com.ruckus.cloud.venue.model.venue'?: string[]
}

export enum NotificationType {
  apFirmware = 'DEVICE_AP_FIRMWARE',
  switchFirmware = 'DEVICE_SWITCH_FIRMWARE',
  edgeFirmware = 'DEVICE_EDGE_FIRMWARE',
  apiChanges = 'NEW_API_PUBLISH'
}

export enum SmsProviderType {
  RUCKUS_ONE = 'RUCKUS_ONE',
  TWILIO = 'TWILIO',
  ESENDEX = 'ESENDEX',
  OTHERS = 'OTHERS',
  SMSProvider_UNSET = 'SMSProvider_UNSET'
}

export interface NotificationSmsUsage
{
  ruckusOneUsed?: number,
  threshold?: number,
  provider?: SmsProviderType
}

export interface NotificationSmsConfig
{
  // twilio
  accountSid?: string,
  authToken?: string,
  fromNumber?: string,
  enableWhatsapp?: boolean,
  authTemplateSid?: string,
  // esendex
  apiKey?: string,
  // others
  url?: string
}

export interface TwiliosIncommingPhoneNumbers
{
  incommingPhoneNumbers?: string[]
}

export interface TwiliosMessagingServices
{
  messagingServiceResources?: string[]
}

export interface TwiliosWhatsappServices
{
  approvalFetch?: {
    sid: string,
    whatsapp: {
      allow_category_change: boolean,
      category: string,
      content_type: string,
      flows: string | null,
      name: string,
      rejection_reason: string,
      status: string,
      type: string
    },
    url: string,
    accountSid: string
  },
  hasError?: boolean,
  errorMessage?: string
}

export interface ErrorsResult<T> {
  data: T;
  status: number;
}

export interface ErrorDetails {
  code: string,
  message?: string,
  errorMessage?: string
}

export enum WebhookPayloadEnum {
  RUCKUS = 'RUCKUS One',
  DATADOG = 'DataDog',
  MICROSOFT_TEAM = 'Microsoft Teams',
  // JIRA = 'Jira',
  PAGERDUTY = 'PagerDuty',
  SERVICE_NOW = 'ServiceNow',
  SLACK = 'Slack',
  // ELASTIC = 'Elastic',
  SPLUNK = 'Splunk'
}

export enum WebhookIncidentEnum {
  SEVERITY_P1 = 'INCIDENT_SEVERITY_P1',
  SEVERITY_P2 = 'INCIDENT_SEVERITY_P2',
  SEVERITY_P3 = 'INCIDENT_SEVERITY_P3',
  SEVERITY_P4 = 'INCIDENT_SEVERITY_P4',
}

export enum WebhookActivityEnum {
  PRODUCT_GENERAL = 'ACTIVITY_PRODUCT_GENERAL',
  PRODUCT_WIFI = 'ACTIVITY_PRODUCT_WIFI',
  PRODUCT_SWITCH = 'ACTIVITY_PRODUCT_SWITCH',
  PRODUCT_EDGE = 'ACTIVITY_PRODUCT_EDGE'
}

export enum WebhookEventEnum {
  SEVERITY_CRITICAL = 'EVENT_SEVERITY_CRITICAL',
  SEVERITY_WARNING = 'EVENT_SEVERITY_WARNING',
  SEVERITY_MAJOR = 'EVENT_SEVERITY_MAJOR',
  SEVERITY_INFO = 'EVENT_SEVERITY_INFO',
  SEVERITY_MINOR = 'EVENT_SEVERITY_MINOR',
  TYPE_AP = 'EVENT_TYPE_AP',
  TYPE_NETWORK = 'EVENT_TYPE_NETWORK',
  TYPE_SECURITY = 'EVENT_TYPE_SECURITY',
  TYPE_EDGE = 'EVENT_TYPE_EDGE',
  TYPE_CLIENT = 'EVENT_TYPE_CLIENT',
  TYPE_PROFILE = 'EVENT_TYPE_PROFILE',
  TYPE_SWITCH = 'EVENT_TYPE_SWITCH',
  TYPE_ADMIN = 'EVENT_TYPE_ADMIN',
  PRODUCT_GENERAL = 'EVENT_PRODUCT_GENERAL',
  PRODUCT_WIFI = 'EVENT_PRODUCT_WIFI',
  PRODUCT_SWITCH = 'EVENT_PRODUCT_SWITCH',
  PRODUCT_EDGE = 'EVENT_PRODUCT_EDGE'
}

export interface Webhook {
  id?: string,
  name?: string,
  url?: string,
  secret?: string,
  payload?: string,
  status?: string,
  incident: Record<string, string[]>,
  activity: Record<string, string[]>,
  event: Record<string, string[]>
}

export interface ScopePermission extends Record<string, string|boolean> {
  name: string
  id: string
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
}

export enum PermissionType {
  read = 'r',
  create = 'c',
  update = 'u',
  delete = 'd'
}

export enum PrivacyFeatureName {
  ARC='ARC',
  APP_VISIBILITY='APP_VISIBILITY'
}

export interface PrivacySettings {
  featureName: PrivacyFeatureName,
  isEnabled: boolean
}

export interface PrivacyFeatures {
  privacyFeatures: PrivacySettings[]
}

export interface ScopeFeature {
  id: string,
  name: string,
  description: string,
  category: string,
  subFeatures?: ScopeFeature[],
  inTandem?: boolean
}

export interface ScopeTreeDataNode extends TreeDataNode {
  inTandem?: boolean
}
