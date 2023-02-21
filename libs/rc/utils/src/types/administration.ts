import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import { EntitlementDeviceType, EntitlementDeviceSubType } from './msp'

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
  deviceCount?: number;
}

export interface NewEntitlementSummary {
  banners: Array<unknown>;
  entitlements: Entitlement[];
  summary: EntitlementSummary[];
}

export const EntitlementDeviceTypeDisplayText = {
  [EntitlementDeviceType.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [EntitlementDeviceType.SWITCH]: defineMessage({ defaultMessage: 'Switch' }),
  [EntitlementDeviceType.LTE]: defineMessage({ defaultMessage: 'LTE' }),
  [EntitlementDeviceType.ANALYTICS]: defineMessage({ defaultMessage: 'Analytics' }),
  [EntitlementDeviceType.MSP_WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [EntitlementDeviceType.MSP_SWITCH]: defineMessage({ defaultMessage: 'Switch' })
}

export type EntitlementDeviceTypes = Array<{ label:string, value:EntitlementDeviceType }>
export const getEntitlementDeviceTypes = () : EntitlementDeviceTypes => {
  return Object.keys(EntitlementDeviceType)
    .map(key => ({
      label: getIntl().$t(EntitlementDeviceTypeDisplayText[key as EntitlementDeviceType]),
      value: key as EntitlementDeviceType
    }))

}