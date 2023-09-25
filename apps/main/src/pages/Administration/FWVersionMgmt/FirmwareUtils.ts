import moment        from 'moment-timezone'
import { IntlShape } from 'react-intl'

import {
  firmwareTypeTrans,
  FirmwareCategory,
  FirmwareVersion,
  FirmwareVenue,
  FirmwareSwitchVenue,
  FirmwareVenueVersion,
  FirmwareType,
  Schedule,
  LatestEdgeFirmwareVersion
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

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

export const compareVersions = (a?: string, b?: string): number => {
  const v1 = (a || '').split('.')
  const v2 = (b || '').split('.')
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    const res = Number(v1[i]) - Number(v2[i])
    if (res !== 0) {
      return res
    }
  }
  return 0
}

export const isBetaFirmware = (category: FirmwareCategory): boolean => {
  return category.toUpperCase() === FirmwareCategory.BETA.toUpperCase()
}

export const compareSwitchVersion = (a: string, b: string): number => {
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:_cd(?<candidate>\d+))?(?:_rc(?<rcbuild>\d+))?(?:_b(?<build>\d+))?$/
  const group1 = a?.match(switchVersionReg)?.groups
  const group2 = b?.match(switchVersionReg)?.groups
  if (group1 && group2) {
    let res = 0
    const keys = ['major', 'rcbuild', 'minor', 'candidate', 'build']
    keys.every(key=>{
      const initValue = (key === 'candidate') ? '0' : (key === 'build') ? '999' : ''
      const aValue = group1[key] || initValue
      const bValue = group2[key] || initValue
      res = aValue.localeCompare(bValue, 'en-u-kn-true') // sort by charCode and numeric

      if (key === 'rcbuild' && (
        (aValue && bValue === '' && !group2['build']) ||
        (aValue === '' && !group1['build'] && bValue)
      )) { // '10010xxx' == '10010_rc2'
        res = 0
        return false
      }
      return res === 0 // false to break every loop
    })
    return res
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

type FirmwareVersionType = FirmwareVersion | FirmwareVenueVersion | LatestEdgeFirmwareVersion

const categoryIsReleaseFunc = ((lv: FirmwareVersionType) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

export function getReleaseFirmware<T extends FirmwareVersionType> (firmwareVersions: T[] = []):T[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}

type VersionLabelType = {
  name: string,
  category: FirmwareCategory,
  onboardDate?: string,
  releaseDate?: string
}
// eslint-disable-next-line max-len
export const getVersionLabel = (intl: IntlShape, version: VersionLabelType, showType: boolean = true): string => {
  const transform = firmwareTypeTrans(intl.$t)
  const versionName = version?.name
  const versionType = transform(version?.category)
  const displayDate = version.releaseDate ?? version.onboardDate
  const versionDate = displayDate ? toUserDate(displayDate) : ''

  // eslint-disable-next-line max-len
  return `${versionName}${showType ? ` (${versionType}) ` : ' '}${versionDate ? '- ' + versionDate : ''}`
}

export const getSwitchVersionLabel = (intl: IntlShape, version: FirmwareVersion): string => {
  const transform = firmwareTypeTrans(intl.$t)
  const versionName = parseSwitchVersion(version?.name)
  const versionType = transform(version?.category)

  let displayVersion = `${versionName} (${versionType})`
  if(version.inUse){
    // eslint-disable-next-line max-len
    displayVersion = `${displayVersion} - ${intl.$t({ defaultMessage: 'Selected Venues are already on this release' })}`
  }
  return displayVersion
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

export const getNextScheduleTpl = (intl: IntlShape, venue: FirmwareSwitchVenue) => {
  const schedule = venue.nextSchedule
  if (schedule?.timeSlot?.startDateTime) {
    let endTime = moment(schedule.timeSlot.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.timeSlot.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    // eslint-disable-next-line max-len
    const isVersionSkipped: boolean | string = getLastSkippedSwitchVersion(venue) && venue.availableVersions.some(version => version.version === getLastSkippedSwitchVersion(venue))
    // eslint-disable-next-line max-len
    return isVersionSkipped ? intl.$t({ defaultMessage: 'Not scheduled (Skipped)' }) : intl.$t({ defaultMessage: 'Not scheduled' })
  }
}

// eslint-disable-next-line max-len
const scheduleTypeIsApFunc = (value: Schedule) => value?.versionInfo?.type === FirmwareType.AP_FIRMWARE_UPGRADE

const getApSchedule = (venue: FirmwareVenue): Schedule | undefined => {
  const apSchedules = venue.nextSchedules?.filter(scheduleTypeIsApFunc)
  return apSchedules && apSchedules.length > 0 ? apSchedules[0] : undefined
}

const getLastSkippedApVersion = (venue: FirmwareVenue) : string | undefined => {
  const version = venue.lastSkippedVersions && venue.lastSkippedVersions.filter(typeIsApFunc)
  return version && version.length > 0 ? version[0].version : undefined
}

const getApAvailableVersions = (venue: FirmwareVenue) : FirmwareVenueVersion[] => {
  return venue.availableVersions && venue.availableVersions.filter(typeIsApFunc)
}

export const getApSchedules = (venue: FirmwareVenue): Schedule[] => {
  const apSchedules = venue.nextSchedules?.filter(scheduleTypeIsApFunc)
  return apSchedules && apSchedules.length > 0 ? apSchedules : []
}

export const getApNextScheduleTpl = (venue: FirmwareVenue) => {
  const { $t } = getIntl()
  const schedule = getApSchedule(venue)

  if (schedule) {
    let endTime = moment(schedule.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    // eslint-disable-next-line max-len
    const isVersionSkipped: boolean | string | undefined = getLastSkippedApVersion(venue) && getApAvailableVersions(venue).some(version => version.version === getLastSkippedApVersion(venue))
    // eslint-disable-next-line max-len
    return isVersionSkipped ? $t({ defaultMessage: 'Not scheduled (Skipped)' }) : $t({ defaultMessage: 'Not scheduled' })
  }
}

// eslint-disable-next-line max-len
export const getNextSchedulesTooltip = (venue: FirmwareVenue): string | undefined => {
  const { $t } = getIntl()
  const transform = firmwareTypeTrans($t)
  const schedules = getApSchedules(venue)
  const content: string[] = []

  schedules.forEach((schedule: Schedule) => {
    // eslint-disable-next-line max-len
    content.push(schedule.versionInfo.version + ' (' + transform(schedule.versionInfo.category as FirmwareCategory) + ')')
  })

  return content.join('\n')
}

export const isSwitchNextScheduleTooltipDisabled = (venue: FirmwareSwitchVenue) => {
  return venue.nextSchedule
}

export const getSwitchNextScheduleTplTooltip = (venue: FirmwareSwitchVenue): string | undefined => {
  if (venue.nextSchedule) {
    const versionName = venue.nextSchedule.version?.name
    const versionAboveTenName = venue.nextSchedule.versionAboveTen?.name
    let names = []

    if (versionName) {
      names.push(parseSwitchVersion(versionName))
    }

    if (versionAboveTenName) {
      names.push(parseSwitchVersion(versionAboveTenName))
    }
    return names.join(', ')
  }
  return ''
}

export const parseSwitchVersion = (version: string) => {
  const defaultVersion = [
    '09010f_b19', '09010e_b392', '10010_rc3', '10010a_b36',
    '09010h_rc1', '10010a_cd3_b11']

  if (defaultVersion.includes(version)) {
    return convertSwitchVersionFormat(version.replace(/_[^_]*$/, ''))
  }
  return convertSwitchVersionFormat(version)
}

export const convertSwitchVersionFormat = (version: string) => {
  // eslint-disable-next-line max-len
  const switchVersionReg = /^(?:[A-Z]{3,})?(?<major>\d{4,})(?<minor>[a-z]*)(?:(?<build>(_[a-z]*\d+)*))?$/
  const versionGroup = version?.match(switchVersionReg)?.groups
  const newVersionGroup: string[] = []

  if (versionGroup) {
    const majorVersionReg = /(\d{2,})(\d+)(\d{2,})$/
    const majorGroup = versionGroup['major']?.match(majorVersionReg)

    if (majorGroup && majorGroup.shift()) { // remove matched full string
      if (majorGroup[0].startsWith('0')) {
        majorGroup[0] = majorGroup[0].replace(/^0+/, '')
      }
      newVersionGroup.push(majorGroup.join('.'))
    }
    newVersionGroup.push(versionGroup['minor'])
    newVersionGroup.push(versionGroup['build'])

    return newVersionGroup.join('')
  }
  return version
}

