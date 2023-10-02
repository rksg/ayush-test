import { pick }                             from 'lodash'
import moment                               from 'moment-timezone'
import { defineMessage, MessageDescriptor } from 'react-intl'

export enum DateRange {
  last8Hours = 'Last 8 Hours',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
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
let ranges = defaultRanges()

export const resetRanges = () => { ranges = defaultRanges() }

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
  duration: number,
  durationType: string
): [moment.Moment, moment.Moment] {
  return [
    moment()
      .subtract(duration as moment.DurationInputArg1, durationType as moment.DurationInputArg2)
      .seconds(0),
    moment().seconds(0)
  ]
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
