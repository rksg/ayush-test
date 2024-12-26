import { IntlShape } from 'react-intl'

export interface UpgradePreferences {
  days?: Array<string>,
  times?: Array<string>,
  autoSchedule?: boolean,
  betaProgram?: boolean
}

export interface SwitchFirmwarePredownload {
  preDownload: boolean
}

export const AVAILABLE_DAYS: Array<{ value: string, label: string }> = [
  { value: 'Sunday', label: 'Sunday' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' }
]

export const AVAILABLE_SLOTS: Array<{ value: string, label: string }> = [
  { value: '00:00-02:00', label: '12 AM - 02 AM' },
  { value: '02:00-04:00', label: '02 AM - 04 AM' },
  { value: '04:00-06:00', label: '04 AM - 06 AM' },
  { value: '06:00-08:00', label: '06 AM - 08 AM' },
  { value: '08:00-10:00', label: '08 AM - 10 AM' },
  { value: '10:00-12:00', label: '10 AM - 12 PM' },
  { value: '12:00-14:00', label: '12 PM - 02 PM' },
  { value: '14:00-16:00', label: '02 PM - 04 PM' },
  { value: '16:00-18:00', label: '04 PM - 06 PM' },
  { value: '18:00-20:00', label: '06 PM - 08 PM' },
  { value: '20:00-22:00', label: '08 PM - 10 PM' },
  { value: '22:00-00:00', label: '10 PM - 12 AM' }
]

export const SCHEDULE_START_TIME_FORMAT = 'dddd, MMM. DD, hh A'
export const SCHEDULE_END_TIME_FORMAT = 'hh A'

export interface UpdateScheduleRequest {
  date?: string;
  time?: string;
  venues?: Array<{ id: string, version: string, type: FirmwareType }>;
  preDownload?: boolean;
  venueIds?: string[] | null
  switchVersion?: string
  switchVersionAboveTen?: string
}

export interface EdgeUpdateScheduleRequest {
  date?: string;
  time?: string;
  version?: string
  venueIds?: string[] | null
}

export interface UpdateNowRequest {
  firmwareCategoryId?: string;
  firmwareSequence?: number,
  firmwareVersion?: string;
  venueIds: Array<string>;
}

export enum FirmwareCategory {
  RECOMMENDED = 'RECOMMENDED',
  CRITICAL = 'CRITICAL',
  BETA = 'BETA',
  REGULAR = 'REGULAR',
  LATEST = 'LATEST',
  EARLY_ACCESS = 'EARLY_ACCESS'
}

export enum FirmwareLabel {
  ALPHA = 'alpha',
  BETA = 'beta',
  GA = 'ga',
  LEGACYALPHA = 'legacyAlpha',
  LEGACYBETA = 'legacyBeta',
}

export enum UpdateAdvice {
  RECOMMENDED = 'RECOMMENDED',
  HIGHLY_RECOMMENDED = 'HIGHLY RECOMMENDED'
}

export enum FirmwareType {
  AP_FIRMWARE_UPGRADE = 'AP_FIRMWARE_UPGRADE',
  DP_FIRMWARE_UPGRADE = 'DP_FIRMWARE_UPGRADE',
  SWITCH_FIRMWARE_UPGRADE = 'SWITCH_FIRMWARE_UPGRADE',
  EDGE_FIRMWARE_UPGRADE = 'EDGE_FIRMWARE_UPGRADE',
}

export enum ApModelFamilyType {
  WIFI_11AC_1 = 'AC_WAVE1',
  WIFI_11AC_2 = 'AC_WAVE2',
  WIFI_6 = 'WIFI_6',
  WIFI_6E = 'WIFI_6E',
  WIFI_7 = 'WIFI_7'
}

export const defaultApModelFamilyDisplayNames: { [key in ApModelFamilyType]: string } = {
  [ApModelFamilyType.WIFI_11AC_1]: '11ac',
  [ApModelFamilyType.WIFI_11AC_2]: '11ac wave2',
  [ApModelFamilyType.WIFI_6]: 'Wi-Fi 6',
  [ApModelFamilyType.WIFI_6E]: 'Wi-Fi 6E',
  [ApModelFamilyType.WIFI_7]: 'Wi-Fi 7'
}

export interface VenueUpdateAdvice {
  type: FirmwareType;
  advice: UpdateAdvice;
}

export interface FirmwareVersion {
  id: string;
  name: string;
  abf?: string;
  sequence?: number;
  supportedApModels?: string[];
  category: FirmwareCategory;
  releaseNotesUrl?: string;
  features?: string[];
  impacts?: string[];
  affectNetwork?: boolean;
  createdDate?: string; // onboardDate
  onboardDate?: string;
  releaseDate?: string;
  inUse?: boolean;
  isDowngraded10to90?: boolean;
  isDowngradeVersion?: boolean;
}

export enum SwitchFirmwareModelGroup {
  ICX71 = 'ICX71',
  ICX7X = 'ICX7X',
  ICX81 = 'ICX81',
  ICX82 = 'ICX82'
}

export const SwitchModelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
  [SwitchFirmwareModelGroup.ICX71]: '(7150)' ,
  [SwitchFirmwareModelGroup.ICX7X]: '(7550-7850)',
  [SwitchFirmwareModelGroup.ICX81]: '(8100)',
  [SwitchFirmwareModelGroup.ICX82]: '(8200)'
}

export const SwitchModelGroupDisplayTextValue: { [key in SwitchFirmwareModelGroup]: string } = {
  [SwitchFirmwareModelGroup.ICX71]: 'ICX 7150' ,
  [SwitchFirmwareModelGroup.ICX7X]: 'ICX 7550-7850',
  [SwitchFirmwareModelGroup.ICX81]: 'ICX 8100',
  [SwitchFirmwareModelGroup.ICX82]: 'ICX 8200'
}

export interface SwitchVersion1002 {
  id: string;
  name: string;
  category: FirmwareCategory;
  createdDate?: string;
  inUse?: boolean;
  isDowngradeVersion?: boolean;
  isDowngraded10to90?: boolean;
}

export interface FirmwareVersion1002 {
  modelGroup: SwitchFirmwareModelGroup;
  versions: string[];
}

export interface SwitchFirmwareVersion1002 {
  modelGroup: SwitchFirmwareModelGroup;
  versions: SwitchVersion1002[];
  switchCount?: number;
}

export interface ABFVersion {
  abf: string;
  sequence?: number;
  id: string;
  name: string;
  category: FirmwareCategory;
  releaseDate: string;
  onboardDate: string;
  supportedApModels?: string[];
}

export interface ApModelFamily {
  name: ApModelFamilyType;
  displayName: string;
  apModels: string[]
}

export interface EolApFirmware {
  name: string;
  currentEolVersion: string;
  latestEolVersion: string;
  apCount: string;
  apModels: string[];
  isAbfGreaterThanVenueCurrentAbf: boolean;
  sequence?: number;
}

export interface FirmwareVenue {
  id: string;
  name: string;
  versions: FirmwareVenueVersion[];
  updatedAdvice: VenueUpdateAdvice;
  availableVersions: FirmwareVenueVersion[];
  nextSchedules: Schedule[];
  lastSkippedVersions: FirmwareVenueVersion[];
  versionHistory: VersionHistory[];
  lastScheduleUpdate: string;
  eolApFirmwares?: EolApFirmware[];
  apModels?: string[];
  currentVenueUnsupportedApModels? : string[]
}

export interface FirmwareVenueVersion {
  version: string;
  category?: FirmwareCategory;
  type: FirmwareType;
  sequence?: number;
}

export interface Schedule {
  startDateTime: string;
  versionInfo: ScheduleVersionInfo;
}

export interface ScheduleVersionInfo {
  version: string;
  category?: FirmwareCategory;
  type: FirmwareType;
}

export interface SkippedVersion {
  version: string;
  type: FirmwareType;
}

export interface VersionHistory {
  version: string;
  type: FirmwareType;
  deployedDateTime: string;
}

export interface switchVersion {
  id: string;
  name: string;
  version?: string;
  category: FirmwareCategory;
}

export interface switchSchedule {
  timeSlot: {
    endDateTime?: string;
    startDateTime?: string;
    versionInfo?: ScheduleVersionInfo;
  };
  version?: {
    id: string;
    name: string;
    category: FirmwareCategory;
  };
  versionAboveTen?: {
    name: string;
    category: FirmwareCategory;
  }
}

export interface SwitchScheduleV1002 {
  timeSlot: {
    endDateTime?: string;
    startDateTime?: string;
    versionInfo?: ScheduleVersionInfo;
  };
  version: string;
}

export interface SwitchScheduleV1002 {
  timeSlot: {
    endDateTime?: string;
    startDateTime?: string;
    versionInfo?: ScheduleVersionInfo;
  };
  supportModelGroupVersions: FirmwareSwitchVenueVersionsV1002[];
}

export interface FirmwareSwitchVenue {
  id: string;
  venueId?: string;
  name: string;
  venueName: string;
  preDownload: boolean;
  switchFirmwareVersionAboveTen: switchVersion;
  switchFirmwareVersion: switchVersion;
  updatedAdvice?: VenueUpdateAdvice;
  availableVersions: switchVersion[];
  nextSchedule: switchSchedule;
  lastSkippedVersions?: SkippedVersion[];
  versionHistory?: VersionHistory[];
  lastScheduleUpdateTime: string;
  switchCount: number;
  aboveTenSwitchCount: number;
  status: SwitchFirmwareStatusType;
  scheduleCount: number;
}

export interface FirmwareSwitchVenueVersionsV1002 {
  modelGroup: SwitchFirmwareModelGroup;
  version: string;
}
export interface FirmwareSwitchVenueSwitchCountsV1002 {
  modelGroup: SwitchFirmwareModelGroup;
  count: number;
}

export interface FirmwareSwitchVenueV1002 {
  venueId: string;
  venueName: string;
  preDownload: boolean;
  versions:FirmwareSwitchVenueVersionsV1002[];
  nextSchedule?: SwitchScheduleV1002;
  lastScheduleUpdateTime: string;
  switchCounts: FirmwareSwitchVenueSwitchCountsV1002[];
  status: SwitchFirmwareStatusType;
  scheduleCount: number;
}

export interface FirmwareSwitchV1002 {
  versions:FirmwareSwitchVenueVersionsV1002[];
  switchCounts: FirmwareSwitchVenueSwitchCountsV1002[];
}


export enum SwitchFirmwareStatusType {
  NONE = 'NONE',
  INITIATE = 'INITIATE',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface SwitchFirmware {
  switchId: string;
  id: string;
  switchName: string;
  isStack: boolean;
  venueId: string;
  model: string;
  venueName: string;
  preDownload: boolean;
  isSwitchLevelSchedule: boolean;
  currentFirmware: string;
  availableVersion: switchVersion;
  updatedAdvice?: VenueUpdateAdvice;
  availableVersions: switchVersion[];
  switchNextSchedule: switchSchedule;
  venueNextSchedule: switchSchedule;
}

export interface SwitchFirmwareV1002 {
  switchId: string;
  id: string;
  switchName: string;
  isStack: boolean;
  venueId: string;
  model: string;
  venueName: string;
  preDownload: boolean;
  isSwitchLevelSchedule: boolean;
  currentFirmware: string;
  availableVersion: switchVersion;
  updatedAdvice?: VenueUpdateAdvice;
  availableVersions: switchVersion[];
  switchNextSchedule: SwitchScheduleV1002;
  venueNextSchedule: switchSchedule;
}

export enum SwitchFwStatusEnum {
  FW_UPD_START = 'FW_UPD_START',
  FW_UPD_VALIDATING_PARAMETERS = 'FW_UPD_VALIDATING_PARAMETERS',
  FW_UPD_DOWNLOADING = 'FW_UPD_DOWNLOADING',
  FW_UPD_VALIDATING_IMAGE = 'FW_UPD_VALIDATING_IMAGE',
  FW_UPD_SYNCING_TO_REMOTE = 'FW_UPD_SYNCING_TO_REMOTE',
  FW_UPD_WRITING_TO_FLASH = 'FW_UPD_WRITING_TO_FLASH',
  FW_UPD_COMPLETE = 'FW_UPD_COMPLETE',
  FW_UPD_FAIL = 'FW_UPD_FAIL',
  FW_UPD_PRE_DOWNLOAD_COMPLETE = 'FW_UPD_PRE_DOWNLOAD_COMPLETE',
  FW_UPD_WAITING_RESPONSE = 'FW_UPD_WAITING_RESPONSE'
}

export enum SwitchStatusRdbEnum {
  OPERATIONAL = 'ONLINE',
  DISCONNECTED = 'OFFLINE',
  PROVISION = 'PROVISION',
  DISCOVERY = 'DISCOVERY',
  HBLOST = 'HBLOST',
  REBOOTING = 'REBOOTING',
  FIRMWARE_UPGRADING = 'FIRMWARE_UPGRADING',
  UNRECOGNIZED = 'UNRECOGNIZED',
  RELOADING = 'RELOADING',
  PRIME_UPGRADE_COMPLETED = 'PRIME_UPGRADE_COMPLETED'
}

export interface SwitchFirmwareStatus {
  switchId: string;
  switchName: string;
  status: SwitchFwStatusEnum;
  targetFirmware: string;
  switchStatus: SwitchStatusRdbEnum;
  lastStatusUpdateTime?: string;
}

export interface CurrentVersions {
  currentVersions: string[];
  currentVersionsAboveTen: string[];
  generalVersions: string[];
}

export interface CurrentVersionsV1002 {
  currentVersions: FirmwareVersion1002[];
  generalVersions: string[];
}

export interface PreDownload {
  preDownload: boolean
}

export const firmwareTypeTrans = ($t: IntlShape['$t']) => {
  const firmwareCategories = [
    {
      type: $t({ defaultMessage: 'Release' }),
      subType: $t({ defaultMessage: 'Recommended' }),
      value: FirmwareCategory.RECOMMENDED
    }, {
      type: $t({ defaultMessage: 'Release' }),
      subType: $t({ defaultMessage: 'Critical' }),
      value: FirmwareCategory.CRITICAL
    }, {
      type: $t({ defaultMessage: 'Beta' }),
      value: FirmwareCategory.BETA
    }, {
      type: $t({ defaultMessage: 'Release' }),
      value: FirmwareCategory.REGULAR
    }, {
      type: $t({ defaultMessage: 'Latest' }),
      value: FirmwareCategory.LATEST
    }, {
      type: $t({ defaultMessage: 'Early Access' }),
      value: FirmwareCategory.EARLY_ACCESS
    }
  ]

  return function transform (value: FirmwareCategory, field?: string) {
    const category = firmwareCategories.find(firmwareCategorie =>
      firmwareCategorie.value === value)
    if (!category) {
      return value
    }

    switch (field) {
      case 'type': {
        return category.type
      }
      case 'subType': {
        return category.subType
      }
      default: {
        return category.type + (category.subType ? ' - ' + category.subType : '')
      }
    }
  }
}

export interface FirmwareVenuePerApModel {
  id: string;
  name: string;
  isApFirmwareUpToDate?: boolean;
  isFirmwareUpToDate?: boolean;
  currentApFirmwares?: { apModel: string, firmware: string, labels?: FirmwareLabel[] }[];
  lastApFirmwareUpdate?: string;
  nextApFirmwareSchedules?: Schedule[];
}

export interface ApModelFirmware {
  id: string;
  name: string;
  category: FirmwareCategory;
  releaseDate: string;
  onboardDate: string;
  supportedApModels?: string[];
  labels?: FirmwareLabel[];
}

export interface UpdateFirmwarePerApModelPayload {
  venueIds: string[];
  targetFirmwares: { apModel: string, firmware: string }[];
}

export interface UpdateFirmwareSchedulePerApModelPayload extends UpdateFirmwarePerApModelPayload {
  schedule: {
    date: string;
    time: string;
  }
}

export enum ApFirmwareBatchOperationType {
  UPDATE_NOW = 'UPDATE_NOW',
  SKIP_SCHEDULE = 'SKIP_SCHEDULE',
  CHANGE_SCHEDULE = 'CHANGE_SCHEDULE'
}

export interface ApFirmwareStartBatchOperationResult {
  requestId: string
  response: {
    batchId: string
  }
}

export enum EdgeFirmwareBatchOperationType {
  UPDATE_NOW = 'UPDATE_NOW',
  SKIP_SCHEDULE = 'SKIP_SCHEDULE',
  CHANGE_SCHEDULE = 'CHANGE_SCHEDULE'
}

export interface EdgeFirmwareStartBatchOperationResult {
  requestId: string;
  response: {
    batchId: string;
  }
}

export interface StartEdgeFirmwareVenueUpdateNowPayload {
  venueIds: string[];
  version: string;
  state: string;
}

export interface UpdateEdgeFirmwareVenueSchedulePayload {
  date?: string;
  time?: string;
  version?: string
  venueIds: string[]
}
