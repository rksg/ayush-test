/* eslint-disable max-len */
import { pick }                             from 'lodash'
import moment                               from 'moment-timezone'
import { defineMessage, MessageDescriptor } from 'react-intl'

export enum DateRange {
  today = 'Today',
  last1Hour = 'Last 1 Hour',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  lastMonth = 'Last Month',
  custom = 'Custom',
}

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
      : (ranges as Record<string, [moment.Moment, moment.Moment]>)[range].map(
        (date: moment.Moment) => date.format()
      )
  return { startDate, endDate, range }
}
export function defaultRanges (subRange?: DateRange[]) {
  const defaultRange: Partial<{ [key in DateRange]: moment.Moment[] }> = {
    [DateRange.last1Hour]: [
      moment().subtract(1, 'hours').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.today]: [
      moment().startOf('day').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last24Hours]: [
      moment().subtract(1, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last7Days]: [
      moment().subtract(7, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.lastMonth]: [
      moment().subtract(1, 'month').seconds(0),
      moment().seconds(0)
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
  [DateRange.today]: defineMessage({
    defaultMessage: 'Today'
  }),
  [DateRange.last1Hour]: defineMessage({
    defaultMessage: 'Last 1 Hour'
  }),
  [DateRange.last24Hours]: defineMessage({
    defaultMessage: 'Last 24 Hours'
  }),
  [DateRange.last7Days]: defineMessage({
    defaultMessage: 'Last 7 Days'
  }),
  [DateRange.lastMonth]: defineMessage({
    defaultMessage: 'Last Month'
  }),
  [DateRange.custom]: defineMessage({
    defaultMessage: 'Custom'
  })
}

export const getUserDateFormat = (
  // TODO: userProfile: UserProfile
  dateStr: string,
  recivedDateFormat = 'YYYY-MM-DD HH:mm:ss',
  localTime = false) => {
  const dateFormat = 'mm/dd/yyyy' //userProfile.dateFormat;

  let date: moment.Moment
  if (localTime) {
    date = moment.utc(dateStr).local()
  } else {
    date = moment(dateStr, recivedDateFormat)
  }
  return date.format(dateFormat.toUpperCase() + ' HH:mm:ss')
}

export const getShortDurationFormat = (value: number | string) => {
  const d = moment.duration(value)

  const duration: { [index: string]: number } = {
    years: d.years(),
    months: d.months(),
    days: d.days(),
    hours: d.hours(),
    minutes: d.minutes()
  }

  const result: Array<String> = []
  for (const unit of Object.keys(duration)) {
    if (duration[unit]) {
      result.push(duration[unit] + ' ' + (duration[unit] > 1 ? unit : unit.substr(0, unit.length - 1)))
    }
    if (result.length > 1) {
      break
    }
  }

  if (result.length < 1) {
    result.push('1 minute')
  }

  return result.join(', ')
}

export const millisToProperDuration = (ms:number) => {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const daysms = ms % (24 * 60 * 60 * 1000)
  const hours = Math.floor((daysms) / (60 * 60 * 1000))
  const hoursms = ms % (60 * 60 * 1000)
  const minutes = Math.floor((hoursms) / (60 * 1000))
  const minutesms = ms % (60 * 1000)
  const seconds = Math.floor((minutesms) / (1000))
  if (days > 0) {
    return days + ' ' + (days === 1 ? 'Day' : 'Days') + ' ' + hours + ' ' + (hours <= 1 ? 'Hour' : 'Hours')
  }
  if (hours > 0) {
    return hours + ' ' + (hours === 1 ? 'Hour' : 'Hours') + ' ' + minutes + ' ' + (minutes <= 1 ? 'Minute' : 'Minutes')
  } else {
    return minutes + ' ' + (minutes <= 1 ? 'Minute' : 'Minutes') + ' ' + seconds + ' ' + (seconds <= 1 ? 'Second' : 'Seconds')
  }
}

export const secondToTime = (value:number) => {
  if (!value) {
    return ''
  }

  return millisToProperDuration(value * 1000)
    .replace(/\sDay[s]?/, 'd')
    .replace(/\sHour[s]?/, 'h')
    .replace(/\sMinute[s]?/, 'm')
    .replace(/\sSecond[s]?/, 's')
}