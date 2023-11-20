import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

export const calculateGranularity = (
  start: string, end: string, minGranularity?: string
): string => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  let gran = getGranularity(interval)
  if (overlapsRollup(start)) minGranularity = 'PT1H'
  return minGranularity &&
    moment.duration(minGranularity).asSeconds() > moment.duration(gran).asSeconds()
    ? minGranularity
    : gran
}
const getGranularity = (interval: number) => {
  switch (true) {
    case interval > 24 * 30: // > 1 month
      return 'PT72H'
    case interval > 24 * 7: // 8 days to 30 days
      return 'PT24H'
    case interval > 24 * 1: // 1 day to 7 days
      return 'PT1H'
    default: // less than 1 day
      return 'PT180S'
  }
}
const overlapsRollup = (start: string) => {
  const rollupDays = parseInt(get('DRUID_ROLLUP_DAYS'), 10)
  const rollupDate = moment().utc().startOf('day').subtract(rollupDays, 'days')
  return rollupDays < 36500 && moment(start) < rollupDate
}
