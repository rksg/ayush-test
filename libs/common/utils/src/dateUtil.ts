import { pick }                             from 'lodash'
import moment                               from 'moment-timezone'
import { defineMessage, MessageDescriptor } from 'react-intl'

export enum DateRange {
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  last30Days = 'Last 30 Days',
  custom = 'Custom',
  allTime = 'All Time'
}

type Ranges = Record<string, [moment.Moment, moment.Moment]>
let ranges = defaultRanges()

export const resetRanges = () => { ranges = defaultRanges() }

export function getDateRangeFilter (
  range: DateRange,
  start?: string,
  end?: string
) {
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
    [DateRange.last24Hours]: [
      moment().subtract(1, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last7Days]: [
      moment().subtract(7, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last30Days]: [
      moment().subtract(30, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.allTime]: [
      moment(undefined),
      moment(undefined)
    ]
  }
  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
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
