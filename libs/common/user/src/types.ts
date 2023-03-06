import { RolesEnum } from '@acx-ui/types'

export enum DetailLevel {
  BASIC_USER = 'ba',
  IT_PROFESSIONAL = 'it',
  SUPER_USER = 'su',
  DEBUGGING = 'debug'
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
  initials: string
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
  scheduleVersionList: string[]
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

// remove once Sean addressed getting value from rc-ui
export interface GlobalValues {
  DOCUMENTATION?: string
  HOW_TO_VIDEOS?: string
  CONTACT_SUPPORT?: string
  OPEN_CASE?: string
  MY_OPEN_CASES?: string
  PRIVACY?: string
  CHANGE_PASSWORD?: string
  MANAGE_LICENSES?: string
  MLISA_UI_URL?: string
  CAPTIVE_PORTAL_DOMAIN_NAME?: string
  GOOGLE_MAPS_KEY?: string
  SUPPORTED_AP_MODELS?: string
  ANALYTICS_FREE_TRIAL?: string
  SZ_IP_LIST?: string
  PENDO_API_KEY?: string
  GA_TRACKING_ID?: string
  DISABLE_GA?: string
  API_DOCS?: string
  DISABLE_PENDO?: string
  AG_GRID_KEY?: string
  DOCUMENTATION_CENTER?: string
  AUTO_UPDATE_TABLE_INTERVALS?: string
  AUTO_UPDATE_DASHBOARD_INTERVALS?: string
  AUTO_UPDATE_ALARMS_TABLE_INTERVALS?: string
  AUTO_UPDATE_EVENTS_TABLE_INTERVALS?: string
  CHATBOT_JS_URL?: string
  SPLITIO_FF_KEY?: string
}
