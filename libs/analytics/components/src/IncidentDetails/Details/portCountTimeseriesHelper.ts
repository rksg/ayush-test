import { unitOfTime } from 'moment-timezone'

import { calculateGranularity, granularityToHours } from '@acx-ui/analytics/utils'

export const granularities: typeof granularityToHours = [
  { granularity: 'PT30M', hours: 24 * 3 }, // 30 mins for 3 days and above
  { granularity: 'PT15M', hours: 24 * 1 }, // 15 mins for 1 day and above
  { granularity: 'PT3M', hours: 0 } // 3 mins for less than 1 day
]

export const getTimeseriesBuffer = (start: string, end: string) => {
  const granularity = calculateGranularity(start, end, 'PT3M', granularities)

  const binMinsMap: Record<string, number> = {
    PT3M: 3,
    PT15M: 15,
    PT30M: 30
  }

  const noOfBinsForBufferMap: Record<string, number> = {
    PT3M: 40,
    PT15M: 24,
    PT30M: 12
  }

  const binMins = binMinsMap[granularity] ?? 60 // 60 minutes as default when rollup happens
  const noOfBinsForBuffer = noOfBinsForBufferMap[granularity] ?? 6 // 6 bins as default for 60 minutes granularity when rollup happens

  const buffer = {
    front: { value: binMins * noOfBinsForBuffer, unit: 'minutes' as unitOfTime.Base },
    back: { value: binMins * noOfBinsForBuffer, unit: 'minutes' as unitOfTime.Base }
  }
  return buffer
}
