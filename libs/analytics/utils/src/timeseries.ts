import type { TimeStamp } from '@acx-ui/types'

import type { MultiLineTimeSeriesChartData } from './types/timeseries'

export type TimeSeriesData = {
  [key: string]: (TimeStamp | number | null)[]
}

export function getSeriesData (
  data: TimeSeriesData | null,
  seriesMapping: Array<{ key: string, name: string }>
): MultiLineTimeSeriesChartData[] {
  if (checkNoData(data)) return []
  return seriesMapping.map(({ key, name }) => ({
    name,
    data: (data!['time'] as TimeStamp[]).map((t, index) => {
      const value = data![key][index] as number
      return [t, value === null ? '-' : value]
    })
  }))
}

export function checkNoData (data: TimeSeriesData | null): boolean {
  if (!data) return true
  let isNoData = false
  for (let [key, value] of Object.entries(data)) {
    if(key !== 'time') {
      const uniqueVal = new Set(value)
      uniqueVal.size === 1 && uniqueVal.has(null) ? 
        isNoData = true : isNoData = false
    }
  }
  return isNoData
}
