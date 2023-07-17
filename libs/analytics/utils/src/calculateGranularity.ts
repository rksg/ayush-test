import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

export const calculateGranularity = (
  start: string, end: string, minGranularity?: string, apCount: number = 0
): string => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  let gran = getGranularityByAPCount(interval, apCount)
  if (overlapsRollup(start)) minGranularity = 'PT1H'
  return minGranularity &&
    moment.duration(minGranularity).asSeconds() > moment.duration(gran).asSeconds()
    ? minGranularity
    : gran
}
const getGranularityByAPCount = (interval: number, apCount: number) => {
  switch (true) {
    case interval > 24 * 7:
      switch (true) {
        case apCount < 10000:
          return 'PT1H'
        case apCount < 30000:
          return 'PT12H'
        default:
          return 'PT24H'
      }
    case interval > 24 * 3:
      switch (true) {
        case apCount < 10000:
          return 'PT15M'
        case apCount < 30000:
          return 'PT6H'
        default:
          return 'PT12H'
      }
    default:
      switch (true) {
        case apCount < 10000:
          return 'PT180S'
        case apCount < 30000:
          return 'PT15M'
        default:
          return 'PT1H'
      }
  }
}
const overlapsRollup = (start: string) => {
  const rollupDays = parseInt(get('DRUID_ROLLUP_DAYS'), 10)
  const rollupDate = moment().utc().startOf('day').subtract(rollupDays, 'days')
  return rollupDays < 36500 && moment(start) < rollupDate
}
