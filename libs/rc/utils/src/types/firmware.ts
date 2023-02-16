export enum FirmwareCategory {
  RECOMMENDED = 'RECOMMENDED',
  CRITICAL = 'CRITICAL',
  BETA = 'BETA'
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
  releaseNotesUrl: string;
  features: string[];
  impacts: string[];
  affectNetwork: boolean;
  createdDate?: string; // onboardDate
  onboardDate?: string;
  releaseDate?: string;
}

export interface FirmwareVenue {
  id: string;
  name: string;
  versions: FirmwareVenueVersion[];
  updatedAdvice: VenueUpdateAdvice;
  availableVersions: FirmwareVenueVersion[];
  nextSchedules: Schedule[];
  lastSkippedVersions: SkippedVersion[];
  versionHistory: VersionHistory[];
  lastScheduleUpdate: string;
}

export interface FirmwareVenueVersion {
  version: string;
  category: FirmwareCategory;
  type: FirmwareType;
}

export interface Schedule {
  startDateTime: string;
  versionInfo: ScheduleVersionInfo;
}

export interface ScheduleVersionInfo {
  version: string;
  category: FirmwareCategory;
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

