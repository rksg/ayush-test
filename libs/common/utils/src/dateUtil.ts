import tz_lookup                            from '@photostructure/tz-lookup'
import { pick }                             from 'lodash'
import moment                               from 'moment-timezone'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { ITimeZone } from '@acx-ui/types'

import { DateFilter } from './dateFilter'

export enum DateRange {
  last8Hours = 'Last 8 Hours',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  last14Days = 'Last 14 Days',
  last30Days = 'Last 30 Days',
  custom = 'Custom',
  allTime = 'All Time'
}

export type DateRangeFilter = {
  startDate: string
  endDate: string
  range: DateRange
}

const ceilMinute = () => moment().add(1, 'minutes').seconds(0).milliseconds(0)

type Ranges = Record<string, [moment.Moment, moment.Moment]>
let ranges = defaultAllRanges()

export const resetRanges = () => { ranges = defaultAllRanges() }

export function getDateRangeFilter (
  range: DateRange,
  start?: string,
  end?: string
): DateRangeFilter {
  resetRanges() // reset so it takes latest value

  const [startDate, endDate] =
    range === DateRange.custom && start && end
      ? [start, end]
      : ((ranges as Ranges)[range] ?? ranges[DateRange.last24Hours]).map(
        (date: moment.Moment) => date.format()
      )
  return { startDate, endDate, range }
}
export function getDatePickerValues (state: DateFilter) {
  return state.range !== DateRange.custom
    ? getDateRangeFilter(state.range)
    : state
}

export function defaultAllRanges (subRange?: DateRange[]) {
  const merged = {
    ...defaultRanges(),
    ...defaultCoreTierRanges()
  }

  return subRange ? pick(merged, subRange) : merged
}

export function defaultRanges (subRange?: DateRange[]) {
  const defaultRange: Partial<{ [key in DateRange]: moment.Moment[] }> = {
    [DateRange.last8Hours]: [ceilMinute().subtract(8, 'hours'), ceilMinute()],
    [DateRange.last24Hours]: [ceilMinute().subtract(1, 'days'), ceilMinute()],
    [DateRange.last7Days]: [ceilMinute().subtract(7, 'days'), ceilMinute()],
    [DateRange.last30Days]: [ceilMinute().subtract(30, 'days'), ceilMinute()],
    [DateRange.allTime]: [moment(), moment()]
  }

  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}

export function defaultCoreTierRanges (subRange?: DateRange[]) {
  const defaultRange: Partial<{ [key in DateRange]: moment.Moment[] }> = {
    [DateRange.last8Hours]: [ceilMinute().subtract(8, 'hours'), ceilMinute()],
    [DateRange.last24Hours]: [ceilMinute().subtract(1, 'days'), ceilMinute()],
    [DateRange.last7Days]: [ceilMinute().subtract(7, 'days'), ceilMinute()],
    [DateRange.last14Days]: [ceilMinute().subtract(14, 'days'), ceilMinute()],
    [DateRange.allTime]: [moment(), moment()]
  }

  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}

export function computeRangeFilter <Filter extends object & { dateFilter?: DateRangeFilter }> (
  payload?: Filter,
  names = ['startDate', 'endDate']
): { [key: string]: unknown } | undefined {
  if (!payload) return

  const { dateFilter, ...body } = payload
  if (!dateFilter) return body

  const { startDate, endDate } = getDateRangeFilter(
    dateFilter.range,
    dateFilter.startDate,
    dateFilter.endDate
  )

  return {
    ...body,
    [names[0]]: moment(startDate).utc().format(),
    [names[1]]: moment(endDate).utc().format()
  }
}

export function dateRangeForLast (
  duration: moment.DurationInputArg1,
  durationType: moment.DurationInputArg2
): [moment.Moment, moment.Moment] {
  return [ceilMinute().subtract(duration, durationType), ceilMinute()]
}

export const dateRangeMap : Record<DateRange, MessageDescriptor> = {
  [DateRange.last8Hours]: defineMessage({
    defaultMessage: 'Last 8 Hours'
  }),
  [DateRange.last24Hours]: defineMessage({
    defaultMessage: 'Last 24 Hours'
  }),
  [DateRange.last7Days]: defineMessage({
    defaultMessage: 'Last 7 Days'
  }),
  [DateRange.last14Days]: defineMessage({
    defaultMessage: 'Last 14 Days'
  }),
  [DateRange.last30Days]: defineMessage({
    defaultMessage: 'Last 30 Days'
  }),
  [DateRange.custom]: defineMessage({
    defaultMessage: 'Custom'
  }),
  [DateRange.allTime]: defineMessage({
    defaultMessage: 'All Time'
  })
}

export function getCurrentDate (format: string) {
  return moment().format(format)
}

export function transformTimezoneDifference (timeOffset: number){
  return 'UTC ' + (timeOffset >= 0 ? '+' : '-') + moment.utc(Math.abs(timeOffset) * 1000)
    .format('HH:mm')
}

export const getVenueTimeZone = (lat: number, lng: number): ITimeZone => {
  const timeZoneId = tz_lookup(lat, lng)
  const timeZoneName = moment.utc().tz(timeZoneId).zoneAbbr()
  const rawOffset = moment.utc().tz(timeZoneId).utcOffset()*60
  return {
    timeZoneId, timeZoneName: `${timeZoneId} ${timeZoneName}`,
    rawOffset, dstOffset: 0
  }
}