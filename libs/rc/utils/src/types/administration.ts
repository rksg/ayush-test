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
  delegatedTo: string
  type: TenantDelegationType
  status: TenantDelegationStatus
  delegatedBy: string
  expiryDate: string
  createdDate: string
  delegatedToName: string
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

export enum NotificationEndpointType {
  email = 'EMAIL',
  sms = 'SMS',
  mobile_push = 'MOBILE_PUSH'
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  emailEnabled: boolean;
  mobile: string;
  mobileEnabled: boolean;
}