import moment from 'moment-timezone'

import { get }                        from '@acx-ui/config'
import { getUserProfile, isCoreTier } from '@acx-ui/user'

const granularities = [
  { granularity: 'PT24H', hours: 24 * 7 },
  { granularity: 'PT1H', hours: 24 * 1 },
  { granularity: 'PT15M', hours: 0 }
]

export const calculateGranularity = (
  start: string, end: string, minGranularity?: string
): string => {
  const interval = moment.duration(moment(end).diff(moment(start))).asHours()
  let gran = getGranularity(interval)
  if (overlapsRollup(start) || isCoreTierUser()) minGranularity = 'PT1H'
  return minGranularity &&
    moment.duration(minGranularity).asSeconds() > moment.duration(gran).asSeconds()
    ? minGranularity
    : gran
}
const getGranularity = (interval: number) => {
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

const isCoreTierUser = () => {
  const { accountTier } = getUserProfile()
  return isCoreTier(accountTier)
}