import type { TimeStamp } from '@acx-ui/types'

import type { TimeSeriesChartData } from './types/timeseries'

export type TimeSeriesDataType = TimeStamp | number | null

export type TimeSeriesData = Record<
  string,
  (TimeSeriesDataType[] | ( Record<string, TimeSeriesDataType[]>))
>

export function getSeriesData (
  data: Record<string, TimeSeriesDataType[]> | null,
  seriesMapping: Array<{ key: string, name: string, show?: boolean }>
): TimeSeriesChartData[] {
  if (checkNoData(data)) return []
  return seriesMapping.map((mapping) => ({
    ...mapping,
    data: (data!['time'] as TimeStamp[]).map((t, index) => {
      const value = data![mapping.key][index] as number
      return [t, value === null ? '-' : value]
    })
  }))
}

export function checkNoData (
  data: Record<string, TimeSeriesDataType[]> | null
): boolean {
  if (!data) return true
  return Object.entries(data).every(([key, value])=>{
    if(key === 'time') { return true }
    else {
      const uniqueVal = new Set(value)
      return (uniqueVal.size === 1 && uniqueVal.has(null))
    }
  })
}
