import { RolesEnum } from './msp'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TenantPreferenceSettings {
  global: TenantPreferenceSettingValue;
}

export interface Administrator {
  id: string;
  email: string; // TODO: validation
  name: string; // TODO: validation
  lastName: string;  // TODO: validation
  role: RolesEnum;
  newEmail: string; // TODO: validation
  detailLevel?: string;
  roleDsc?: string;
  inactiveRow?: boolean;
  inactiveTooltip?: string;
  fullName?: string;
}

export interface TenantDetails {
  createdDate: string;
  entitlementId: string;
  externalId: string;
  id: string;
  isActivated: boolean;
  maintenanceState: boolean;
  mspEc?: boolean;
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

export enum NotificationEndpointType {
  email = 'EMAIL',
  sms = 'SMS',
  mobile_push = 'MOBILE_PUSH'
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