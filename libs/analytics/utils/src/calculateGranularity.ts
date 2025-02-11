import moment from 'moment-timezone'

import { get } from '@acx-ui/config'

export const granularityToHours = [
  { granularity: 'PT24H', hours: 24 * 7 },
  { granularity: 'PT1H', hours: 24 * 1 },
  { granularity: 'PT15M', hours: 0 }
]

export const calculateGranularity = (
  start: string, end: string, minGranularity?: string, granularities?: typeof granularityToHours
): string => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  let gran = getGranularity(interval, granularities)
  if (overlapsRollup(start)) minGranularity = 'PT1H'
  return minGranularity &&
    moment.duration(minGranularity).asSeconds() > moment.duration(gran).asSeconds()
    ? minGranularity
    : gran
}
const getGranularity = (interval: number, granularities = granularityToHours) => {
  const items = Array
    .from(granularities)
    .sort((a, b) => b.hours - a.hours)

  let gran = items.at(-1)!.granularity
  for (const { granularity, hours } of items) {
    if (interval > hours) {
      gran = granularity
      break
    }
  }
  return gran
}
export const overlapsRollup = (start: string) => {
  const rollupDays = parseInt(get('DRUID_ROLLUP_DAYS'), 10)
  const rollupDate = moment().utc().startOf('day').subtract(rollupDays, 'days')
  return moment(start) < rollupDate
}
