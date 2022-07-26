import type { MultiLineTimeSeriesChartData } from '@acx-ui/components'
import type { TimeStamp }                    from '@acx-ui/types'

type TimeSeriesData = {
  [key: string]: (TimeStamp | number | null)[]
}

export function getSeriesData (
  data: TimeSeriesData | null,
  seriesMapping: Array<{ key: string, name: string }>
): MultiLineTimeSeriesChartData[] {
  if (!data) return []
  return seriesMapping.map(({ key, name }) => ({
    name,
    data: (data['time'] as TimeStamp[]).map((t, index) => {
      const value = data[key][index] as number
      return [t, value === null ? '-' : value]
    })
  }))
}
