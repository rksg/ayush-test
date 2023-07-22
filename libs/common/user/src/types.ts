import { RolesEnum } from '@acx-ui/types'

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

export interface UserProfile {
  region: string
  swuId: string
  pver: string
  companyName: string
  firstName: string
  lastName: string
  username: string
  role: RolesEnum
  roles: RolesEnum[]
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
  initials?: string
  fullName: string
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

// not sure if it is really belongs to user
export interface CloudVersion {
  versionUpgradeDate: string,
  currentVersion: VersionInfo,
  futureVersion: VersionInfo,
  scheduleVersionList: string[],
  messageBanner: string
}

// not sure if it is really belongs to user
enum UpgradeType { STANDDARD, HOTFIX }

// not sure if it is really belongs to user
interface VersionInfo {
  affectsNetwork: boolean
  createdDate: string
  description: string
  name: string
  id: string
  releaseNotesUrl: string
  scheduleNow: boolean
  upgradeTime: string
  type: UpgradeType | undefined
  features: string[]
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
  response?:{}
}

export interface BetaStatus {
  enabled?: boolean,
  startDate?: string
}
