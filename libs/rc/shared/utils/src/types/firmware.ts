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

export interface UpdateNowRequest {
  firmwareCategoryId?: string;
  firmwareVersion?: string;
  venueIds: Array<string>;
}

export enum FirmwareCategory {
  RECOMMENDED = 'RECOMMENDED',
  CRITICAL = 'CRITICAL',
  BETA = 'BETA',
  REGULAR = 'REGULAR'
}

export enum UpdateAdvice {
  RECOMMENDED = 'RECOMMENDED',
  HIGHLY_RECOMMENDED = 'HIGHLY RECOMMENDED'
}

export enum FirmwareType {
  AP_FIRMWARE_UPGRADE = 'AP_FIRMWARE_UPGRADE',
  DP_FIRMWARE_UPGRADE = 'DP_FIRMWARE_UPGRADE',
  SWITCH_FIRMWARE_UPGRADE = 'SWITCH_FIRMWARE_UPGRADE',
}

export interface VenueUpdateAdvice {
  type: FirmwareType;
  advice: UpdateAdvice;
}

export interface FirmwareVersion {
  id: string;
  name: string;
  category: FirmwareCategory;
  releaseNotesUrl?: string;
  features?: string[];
  impacts?: string[];
  affectNetwork?: boolean;
  createdDate?: string; // onboardDate
  onboardDate?: string;
  releaseDate?: string;
}

export interface ABFVersion {
  abf: string;
  id: string;
  name: string;
  category: FirmwareCategory;
  releaseDate: string;
  onboardDate: string;
}

export interface EolApFirmware {
  name: string;
  currentEolVersion: string;
  latestEolVersion: string;
  apCount: string;
  apModels: string[];
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
}

export interface FirmwareVenueVersion {
  version: string;
  category?: FirmwareCategory;
  type: FirmwareType;
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
  version: string;
  category: FirmwareCategory;
}

export interface switchSchedule {
  timeSlot: {
    startDateTime: string;
    versionInfo: ScheduleVersionInfo;
  };
  version?: {
    name: string;
    category: FirmwareCategory;
  }
  versionAboveTen?: {
    name: string;
    category: FirmwareCategory;
  }
}

export interface FirmwareSwitchVenue {
  id: string;
  name: string;
  preDownload: boolean;
  switchFirmwareVersionAboveTen: switchVersion;
  switchFirmwareVersion: switchVersion;
  updatedAdvice: VenueUpdateAdvice;
  availableVersions: switchVersion[];
  nextSchedule: switchSchedule;
  lastSkippedVersions: SkippedVersion[];
  versionHistory: VersionHistory[];
  lastScheduleUpdateTime: string;
  switchCount?: number;
  aboveTenSwitchCount?: number;
}

export interface CurrentVersions {
  currentVersions: string[];
  currentVersionsAboveTen: string[]
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
