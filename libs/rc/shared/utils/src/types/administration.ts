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
  ldap = 'LDAP'
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
  tenantId: string
  psk: string
}

export interface TenantPreferenceSettingValue {
  [key: string]: unknown;
}

export interface TenantPreferenceSettings {
  global?: TenantPreferenceSettingValue;
  edgeBeta?: TenantPreferenceSettingValue;
}

export interface TenantAccountTierValue {
  acx_account_tier: AccountTier
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
}

export interface TenantMspEc {
  parentMspId?: string;
  serviceEffectiveDate: string;
  serviceExpirationDate: string;
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

export interface NotificationRecipientUIModel {
  id: string;
  description: string;
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

export type EntitlementDeviceTypes = Array<{ label: string, value: EntitlementDeviceType }>
