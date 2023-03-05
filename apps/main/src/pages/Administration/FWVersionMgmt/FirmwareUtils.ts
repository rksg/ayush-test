import moment from 'moment-timezone'

import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenue,
  FirmwareSwitchVenue,
  FirmwareVenueVersion,
  FirmwareType,
  Schedule
} from '@acx-ui/rc/utils'

export const expirationTimeUnits: Record<string, string> = {
  HOURS_AFTER_TIME: 'Hours',
  DAYS_AFTER_TIME: 'Days',
  WEEKS_AFTER_TIME: 'Weeks',
  MONTHS_AFTER_TIME: 'Months',
  YEARS_AFTER_TIME: 'Years'
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

export const compareVersions = (a: String, b: String): number => {
  let v1 = (a || '').split('.')
  let v2 = (b || '').split('.')
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    let res = Number(v1[i]) - Number(v2[i])
    if (res !== 0) {
      return res
    }
  }
  return 0
}

// eslint-disable-next-line max-len
const typeIsApFunc = (value: FirmwareVenueVersion) => value && value.type && value.type === FirmwareType.AP_FIRMWARE_UPGRADE

export const getApVersion = (venue: FirmwareVenue): string | undefined => {
  return getApFieldInVersions(venue, 'version')
}

// eslint-disable-next-line max-len
function getApFieldInVersions<T extends keyof FirmwareVenueVersion> (venue: FirmwareVenue, fieldName: T): FirmwareVenueVersion[T] | undefined {
  if (!venue.versions) {
    return undefined
  }

  const apVersion = venue.versions.filter(typeIsApFunc)
  return apVersion.length > 0 ? apVersion[0][fieldName] : undefined
}

const transform = firmwareTypeTrans()

export const getVersionLabel = (version: FirmwareVersion): string => {
  const versionName = version?.name
  const versionType = transform(version?.category)
  const versionOnboardDate = transformToUserDate(version)

  return `${versionName} (${versionType}) ${versionOnboardDate ? '- ' + versionOnboardDate : ''}`
}

export const getSwitchVersionLabel = (version: FirmwareVersion): string => {
  const versionName = version?.name
  const versionType = transform(version?.category)

  return `${versionName} (${versionType})`
}

const transformToUserDate = (firmwareVersion: FirmwareVersion): string | undefined => {
  return toUserDate(firmwareVersion?.onboardDate as string)
}

export const toUserDate = (date: string): string => {
  if (date) {
    return getDateByFormat(date, 'MM/DD/YYYY hh:mm A')
  }
  return date
}

const getDateByFormat = (date: string, format: string) => {
  return moment(date).format(format)
}

const getLastSkippedSwitchVersion = (venue: FirmwareSwitchVenue) : string => {
  const version = venue.lastSkippedVersions
  return version && version.length > 0 ? version[0].version : ''
}

export const getNextScheduleTpl = (venue: FirmwareSwitchVenue) => {
  const schedule = venue.nextSchedule
  if (schedule?.timeSlot?.startDateTime) {
    let endTime = moment(schedule.timeSlot.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.timeSlot.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    // eslint-disable-next-line max-len
    const isVersionSkipped: boolean | string = getLastSkippedSwitchVersion(venue) && venue.availableVersions.some(version => version.version === getLastSkippedSwitchVersion(venue))
    return isVersionSkipped ? 'Not scheduled (Skipped)' : 'Not scheduled'
  }
}

// eslint-disable-next-line max-len
const scheduleTypeIsApFunc = (value: Schedule) => value && value.versionInfo && value.versionInfo.type && value.versionInfo.type === FirmwareType.AP_FIRMWARE_UPGRADE

const getApSchedule = (venue: FirmwareVenue): Schedule | undefined => {
  const apSchedules = venue.nextSchedules && venue.nextSchedules.filter(scheduleTypeIsApFunc)
  return apSchedules && apSchedules.length > 0 ? apSchedules[0] : undefined
}

const getLastSkippedApVersion = (venue: FirmwareVenue) : string | undefined => {
  const version = venue.lastSkippedVersions && venue.lastSkippedVersions.filter(typeIsApFunc)
  return version && version.length > 0 ? version[0].version : undefined
}

const getApAvailableVersions = (venue: FirmwareVenue) : FirmwareVenueVersion[] => {
  return venue.availableVersions && venue.availableVersions.filter(typeIsApFunc)
}

export const getApNextScheduleTpl = (venue: FirmwareVenue) => {
  const schedule = getApSchedule(venue)
  if (schedule) {
    let endTime = moment(schedule.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    // eslint-disable-next-line max-len
    const isVersionSkipped: boolean | string | undefined = getLastSkippedApVersion(venue) && getApAvailableVersions(venue).some(version => version.version === getLastSkippedApVersion(venue))
    return isVersionSkipped ? 'Not scheduled (Skipped)' : 'Not scheduled'
  }
}

