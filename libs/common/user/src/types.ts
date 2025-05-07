import { RolesEnum }   from '@acx-ui/types'
import { AccountTier } from '@acx-ui/utils'

export enum DetailLevel {
  BASIC_USER = 'ba',
  IT_PROFESSIONAL = 'it',
  SUPER_USER = 'su',
  DEBUGGING = 'debug'
}

export enum MFAStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
}

export enum MFAMethod {
  MOBILEAPP = 'MOBILEAPP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export type UserSettingsValuePath = string
export interface UserSettingValue {
  [key: string]: unknown;
}

export interface UserSettingsUIModel {
  [key: string]: UserSettingValue
}

export interface UserSettings {
  [key: string]: string
}

export interface RegionValue {
  name: string
  description: string
  link: string
  current: boolean
}

export enum CustomRoleType {
  SYSTEM = 'System',
  CUSTOM = 'Custom'
}

export interface UserProfile {
  region: string
  swuId: string
  pver: string
  companyName: string
  firstName: string
  lastName: string
  username: string
  role: RolesEnum | string
  roles: RolesEnum[] | string[]
  detailLevel: DetailLevel
  dateFormat: string
  var: boolean
  support: boolean
  varTenantId?: string
  switchEnabled: boolean
  wifiEnabled: boolean
  dogfood: boolean
  delegatedDogfood: boolean
  lteEnabled: boolean
  allowedRegions: RegionValue[]
  tenantId: string
  adminId: string
  externalId: string
  cloudCertStatus: string
  email: string
  phoneNumber: string
  initials?: string
  fullName: string
  preferredLanguage?: string
  customRoleName?: string
  customRoleType?: CustomRoleType
  scopes?: string[],
  preferredNotifications?: {
    emailPreferences: boolean,
    smsPreferences: boolean
  }
}

export type GuestErrorRes = {
  error: {
    status: number
    rootCauseErrors: {
      code: string
      message: string
    }[]
  },
  requestId: string,
  request: {
    url: string,
    method: string
  }
}

// not sure if it is really belongs to user
export interface PlmMessageBanner {
  createdBy: string,
  createdDate: string,
  description: string,
  endTime: string,
  id: string,
  startTime: string,
  tenantType: string,
  updatedDate: string
}

export interface AllowedOperation {
  scope: string[]
  uri: string[]
};
export interface AllowedOperationsResponse {
  allowedOperations: AllowedOperation[]
}

// not sure if it is really belongs to user
export interface CloudVersion {
  scheduleVersionList: string[]
}

export interface MfaDetailStatus {
  contactId?: string
  tenantStatus: MFAStatus
  mfaMethods: MFAMethod[]
  recoveryCodes: string[]
  userId: string
  enabled: boolean
}

export interface MfaOtpMethod {
  contactId: string
  method: string
}

export interface MfaAuthApp {
  key: string
  url: string
}

export interface CommonResult {
  requestId: string
  response?: CommonResponse
}

export interface CommonResponse {
  id?: string
}

export interface BetaStatus {
  enabled?: string,
  startDate?: string
}

export interface BetaFeatures {
  betaFeatures: FeatureAPIResults[]
}

export interface FeatureAPIResults {
  id: string,
  enabled: boolean
}

export interface Feature extends FeatureAPIResults {
  name: string,
  desc: string
}

export interface TenantAccountTierValue {
  acx_account_tier: AccountTier
}

export enum raiPermissionsList {
  'READ_DASHBOARD',
  'READ_INCIDENTS',
  'WRITE_INCIDENTS',
  'READ_HEALTH',
  'WRITE_HEALTH',
  'READ_CLIENT_TROUBLESHOOTING',
  'READ_SERVICE_VALIDATION',
  'WRITE_SERVICE_VALIDATION',
  'READ_CONFIG_CHANGE',
  'READ_APP_INSIGHTS',
  'WRITE_APP_INSIGHTS',
  'READ_VIDEO_CALL_QOE',
  'WRITE_VIDEO_CALL_QOE',

  'READ_ZONES',

  'READ_WIRELESS_CLIENTS_LIST',
  'READ_WIRELESS_CLIENTS_REPORT',
  'READ_WIRED_CLIENTS_LIST',
  'READ_WIRED_CLIENTS_REPORT',

  'READ_ACCESS_POINTS_LIST',
  'READ_ACCESS_POINTS_REPORT',
  'READ_WIFI_NETWORKS_LIST',
  'READ_WLANS_REPORT',
  'READ_APPLICATIONS_REPORT',
  'READ_WIRELESS_REPORT',

  'READ_SWITCH_LIST',
  'READ_WIRED_REPORT',

  'READ_DATA_STUDIO',
  'WRITE_DATA_STUDIO',
  'READ_DATA_CONNECTOR',
  'WRITE_DATA_CONNECTOR',
  'READ_DATA_CONNECTOR_STORAGE',
  'WRITE_DATA_CONNECTOR_STORAGE',
  'READ_REPORTS',
  'READ_OCCUPANCY',
  'WRITE_OCCUPANCY',

  'READ_ONBOARDED_SYSTEMS',
  'READ_USERS',
  'WRITE_USERS',
  'READ_LABELS',
  'WRITE_LABELS',
  'READ_RESOURCE_GROUPS',
  'WRITE_RESOURCE_GROUPS',
  'READ_SUPPORT',
  'WRITE_SUPPORT',
  'READ_LICENSES',
  'WRITE_LICENSES',
  'READ_REPORT_SCHEDULES',
  'WRITE_REPORT_SCHEDULES',
  'READ_DEVELOPERS',
  'WRITE_DEVELOPERS',
  'READ_APPLICATION_TOKENS',
  'WRITE_APPLICATION_TOKENS',
  'READ_WEBHOOKS',
  'WRITE_WEBHOOKS',

  'READ_BRAND360',

  'READ_INTENT_AI',
  'WRITE_INTENT_AI'
}
export type RaiPermission = keyof typeof raiPermissionsList
export type RaiPermissions = Record<RaiPermission, boolean>
