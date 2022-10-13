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
  return Object.entries(data).every(([key, value])=>{
    if(key === 'time') { return true }
    else {
      const uniqueVal = new Set(value)
      return (uniqueVal.size === 1 && uniqueVal.has(null))
    }
  })
}
