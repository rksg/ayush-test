import React from 'react'

import { MultiLineTimeSeriesChartData }          from '@acx-ui/components'
import { NetworkHistoryData }                    from '../../../../apps/analytics/src/widgets/NetworkHistory/services'

export function getSeriesData(data: NetworkHistoryData | null, 
  seriesMapping: Array<{ key: keyof Omit<NetworkHistoryData, 'time'>, name: string }> ): MultiLineTimeSeriesChartData[] {
  if (!data) return []
  return seriesMapping.map(({ key, name }) => ({
    name,
    data: data.time.map((t: string, index: number) =>
      [t, data[key][index]])
  }))
}