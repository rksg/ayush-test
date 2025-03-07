import _             from 'lodash'
import moment        from 'moment-timezone'
import { IntlShape } from 'react-intl'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  EolApFirmware,
  FirmwareCategory,
  FirmwareLabel,
  FirmwareSwitchVenue,
  FirmwareSwitchVenueV1002,
  FirmwareType,
  firmwareTypeTrans,
  FirmwareVenue, FirmwareVenuePerApModel,
  FirmwareVenueVersion,
  FirmwareVersion,
  LatestEdgeFirmwareVersion,
  Schedule
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { ApModelIndividualDisplayDataType, UpdateFirmwarePerApModelFirmware } from './VenueFirmwareListPerApModel'

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

export type MaxABFVersionEntity = {
  maxVersion: string,
  isAllTheSame: boolean,
  latestVersion: string,
}
export type MaxABFVersionMap = {
  [abfName: string]: MaxABFVersionEntity
}

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

// eslint-disable-next-line max-len
const typeIsApFunc = (value: FirmwareVenueVersion) => value && value.type && value.type === FirmwareType.AP_FIRMWARE_UPGRADE

export const getApVersion = (venue: FirmwareVenue): string | undefined => {
  return getApFieldInVersions(venue, 'version')
}

export const getApSequence = (venue: FirmwareVenue): number | undefined => {
  return getApFieldInVersions(venue, 'sequence')
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

export type VersionLabelType = {
  name: string,
  category: FirmwareCategory,
  onboardDate?: string,
  releaseDate?: string,
  labels?: FirmwareLabel[]
}
// eslint-disable-next-line max-len
export const getVersionLabel = (intl: IntlShape, version: VersionLabelType, showType = true): string => {
  const transform = firmwareTypeTrans(intl.$t)
  const versionName = version?.name
  const versionType = transform(
    isAlphaOrBetaFilter(version?.labels) ? FirmwareCategory.EARLY_ACCESS : version?.category
  )
  const displayDate = version.releaseDate ?? version.onboardDate
  const versionDate = displayDate
    ? formatter(DateFormatEnum.DateFormat)(displayDate)
    : ''

  // eslint-disable-next-line max-len
  return `${versionName}${showType ? ` (${versionType}) ` : ' '}${versionDate ? '- ' + versionDate : ''}`
}

export const isAlphaFilter = (labels: FirmwareLabel[] = []): boolean => {
  return !labels.includes(FirmwareLabel.GA) && labels.includes(FirmwareLabel.ALPHA)
}

// eslint-disable-next-line max-len
export const isBetaFilter = (labels: FirmwareLabel[] = [], ignoreAlphaLabel: boolean = false): boolean => {
  return !labels.includes(FirmwareLabel.GA)
    && (ignoreAlphaLabel || !labels.includes(FirmwareLabel.ALPHA))
    && labels.includes(FirmwareLabel.BETA)
}

export const isAlphaOrBetaFilter = (labels: FirmwareLabel[] = []): boolean => {
  return !labels.includes(FirmwareLabel.GA)
    && (labels.includes(FirmwareLabel.ALPHA) || labels.includes(FirmwareLabel.BETA))
}

export const isLegacyAlphaOrBetaFilter = (labels: FirmwareLabel[] = []): boolean => {
  return !labels.includes(FirmwareLabel.GA)
    && (labels.includes(FirmwareLabel.LEGACYALPHA) || labels.includes(FirmwareLabel.LEGACYBETA))
    && !labels.includes(FirmwareLabel.ALPHA) && !labels.includes(FirmwareLabel.BETA)
}

export const toUserDate = (date: string): string => {
  if (date) {
    return formatter(DateFormatEnum.DateTimeFormatWith12HourSystem)(date)
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

export const getNextScheduleTplV1002 = (intl: IntlShape, venue: FirmwareSwitchVenueV1002) => {
  const schedule = venue.nextSchedule
  if (schedule?.timeSlot?.startDateTime) {
    let endTime = moment(schedule.timeSlot.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.timeSlot.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    return intl.$t({ defaultMessage: 'Not scheduled' })
  }
}

// eslint-disable-next-line max-len
const scheduleTypeIsApFunc = (value: Schedule) => value?.versionInfo?.type === FirmwareType.AP_FIRMWARE_UPGRADE

// eslint-disable-next-line max-len
const getLastSkippedApVersion = (lastSkippedVersions?: FirmwareVenueVersion[]): string | undefined => {
  const version = lastSkippedVersions?.filter(typeIsApFunc)
  return version && version.length > 0 ? version[0].version : undefined
}

// eslint-disable-next-line max-len
const getApAvailableVersions = (availableVersions?: FirmwareVenueVersion[]): FirmwareVenueVersion[] => {
  return availableVersions?.filter(typeIsApFunc) ?? []
}

export const getApSchedules = (nextSchedules?: Schedule[]): Schedule[] => {
  const apSchedules = nextSchedules?.filter(scheduleTypeIsApFunc)
  return apSchedules && apSchedules.length > 0 ? apSchedules : []
}

const getApSchedule = (nextSchedules?: Schedule[]): Schedule | undefined => {
  const apSchedules = getApSchedules(nextSchedules)
  return apSchedules[0]
}

interface getApNextScheduleTplProps {
  nextSchedules?: Schedule[]
  availableVersions?: FirmwareVenueVersion[]
  lastSkippedVersions?: FirmwareVenueVersion[]
}
export const getApNextScheduleTpl = (versionInfo: getApNextScheduleTplProps) => {
  const { $t } = getIntl()
  const { nextSchedules, availableVersions, lastSkippedVersions } = versionInfo
  const schedule = getApSchedule(nextSchedules)

  if (schedule) {
    let endTime = moment(schedule.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    const lastSkippedVersion = getLastSkippedApVersion(lastSkippedVersions)
    // eslint-disable-next-line max-len
    const isVersionSkipped = getApAvailableVersions(availableVersions).some(version => version.version === lastSkippedVersion)
    // eslint-disable-next-line max-len
    return isVersionSkipped ? $t({ defaultMessage: 'Not scheduled (Skipped)' }) : $t({ defaultMessage: 'Not scheduled' })
  }
}

// eslint-disable-next-line max-len
export const getNextSchedulesTooltip = (nextSchedules?: Schedule[]): string | undefined => {
  const { $t } = getIntl()
  const transform = firmwareTypeTrans($t)
  // eslint-disable-next-line max-len
  const schedules = getApSchedules(nextSchedules).sort((a, b) => -compareVersions(a.versionInfo.version, b.versionInfo.version))
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


export function findMaxActiveABFVersion (selectedRows: FirmwareVenue[]): {
  maxVersion: string
  isAllTheSame: boolean
} {
  let selectedMaxVersion: string | undefined
  let isSameVersion = true

  selectedRows.forEach((row: FirmwareVenue) => {
    const version = getApVersion(row)
    if (selectedMaxVersion && compareVersions(version, selectedMaxVersion) !== 0) {
      isSameVersion = false
    }
    if (!selectedMaxVersion || compareVersions(version, selectedMaxVersion) > 0) {
      selectedMaxVersion = version
    }
  })

  return {
    maxVersion: selectedMaxVersion!,
    isAllTheSame: isSameVersion
  }
}

export function compactEolApFirmwares (selectedRows: FirmwareVenue[]): EolApFirmware[] {
  return _.compact(selectedRows.map(row => row.eolApFirmwares)).flat()
}

export function findMaxEolABFVersions (selectedRows: FirmwareVenue[]): MaxABFVersionMap {
  const eolFirmwares = compactEolApFirmwares(selectedRows)
  let result: MaxABFVersionMap = {}

  eolFirmwares.forEach((eol: EolApFirmware) => {
    if (result.hasOwnProperty(eol.name)) {
      const current = result[eol.name]
      const comparedResult = compareVersions(current.maxVersion, eol.currentEolVersion)

      result[eol.name] = {
        maxVersion: comparedResult >= 0 ? current.maxVersion : eol.currentEolVersion,
        isAllTheSame: current.isAllTheSame && comparedResult === 0,
        latestVersion: eol.latestEolVersion
      }
    } else {
      result[eol.name] = {
        maxVersion: eol.currentEolVersion,
        isAllTheSame: true,
        latestVersion: eol.latestEolVersion
      }
    }
  })

  return result
}

function extractActiveApModels (venue: FirmwareVenue): string[] {
  if (!venue.apModels) return []

  const unsupportedApModels = venue.currentVenueUnsupportedApModels ?? []
  return _.difference(venue.apModels, unsupportedApModels) // filter out the unsupported AP models, ACX-44848
}

export function getActiveApModels (selectedRows: FirmwareVenue[]): string[] {
  const activeApModels = selectedRows.flatMap(venue => extractActiveApModels(venue))

  return [...new Set(activeApModels)]
}

export function compareABFSequence (seq1: number = 0, seq2: number = 0): number {
  return seq1 - seq2
}

// eslint-disable-next-line max-len
export function convertToPayloadForApModelFirmware (displayData: ApModelIndividualDisplayDataType[]): UpdateFirmwarePerApModelFirmware {
  return displayData.map((displayDataItem: ApModelIndividualDisplayDataType) => ({
    apModel: displayDataItem.apModel,
    firmware: displayDataItem.defaultVersion
  }))
}

export function patchPayloadForApModelFirmware (
  targetFirmwares: UpdateFirmwarePerApModelFirmware, apModel: string, version: string
): UpdateFirmwarePerApModelFirmware {

  const result: Array<UpdateFirmwarePerApModelFirmware[number] | null> = [...targetFirmwares]

  const targetFirmware = version ? { apModel, firmware: version } : null
  const targetIndex = result.findIndex(existing => existing?.apModel === apModel)

  if (targetIndex === -1) {
    result.push(targetFirmware)
  } else {
    result.splice(targetIndex, 1, targetFirmware)
  }

  return _.compact(result)
}

// eslint-disable-next-line max-len
export function isEarlyAccessOrLegacyEarlyAccess (selectedVenuesFirmwares: FirmwareVenuePerApModel[], apModel: string, extremeFirmware: string) {
  // eslint-disable-next-line max-len
  const currentApFirmwaresList = selectedVenuesFirmwares.flatMap(selectedVenuesFirmware => selectedVenuesFirmware.currentApFirmwares || [])
  const earlyAccess = currentApFirmwaresList.find(
    // eslint-disable-next-line max-len
    fw => fw.apModel === apModel && fw.firmware === extremeFirmware && !fw.labels?.includes(FirmwareLabel.GA)
  )
  const legacyEarlyAccess = currentApFirmwaresList.find(
    // eslint-disable-next-line max-len
    fw => fw.apModel === apModel && fw.firmware === extremeFirmware && isLegacyAlphaOrBetaFilter(fw.labels)
  )

  return {
    earlyAccess,
    legacyEarlyAccess
  }
}
