import _ from 'lodash'

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
    data: _.zip(data!['time'], _.get(data, mapping.key)) as [TimeStamp, number | null][]
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
