import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }                   from '@acx-ui/analytics/utils'
import { Card }                              from '@acx-ui/components'
import { Loader }                            from '@acx-ui/components'
import { MultiLineTimeSeriesChart }          from '@acx-ui/components'
import { cssStr }                            from '@acx-ui/components'
import type { MultiLineTimeSeriesChartData } from '@acx-ui/components'
import { formatter }                         from '@acx-ui/utils'

import {
  useTrafficByVolumeQuery,
  TrafficByVolumeData
} from './services'

const seriesMapping = [
  { key: 'totalTraffic_all', name: 'All Radios' },
  { key: 'totalTraffic_24', name: formatter('radioFormat')('2.4') },
  { key: 'totalTraffic_5', name: formatter('radioFormat')('5') },
  { key: 'totalTraffic_6', name: formatter('radioFormat')('6') }
] as Array<{ key: keyof Omit<TrafficByVolumeData, 'time'>, name: string }>

const lineColors = [
  cssStr('--acx-primary-black'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50'),
  cssStr('--acx-semantics-yellow-40')
]

export const getSeriesData = (data?: TrafficByVolumeData): MultiLineTimeSeriesChartData[] => {
  if (!data) return []
  return seriesMapping.map(({ key, name }) => ({
    name,
    data: data.time.map((t: string, index: number) =>
      [t, data[key][index]])
  }))
}

function TrafficByVolumeWidget () {
  const filters = useGlobalFilter()
  const queryResults = useTrafficByVolumeQuery(filters)

  return (
    <Loader states={[queryResults]}>
      <Card title='Traffic by Volume' >
        <AutoSizer>
          {({ height, width }) => (
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={getSeriesData(queryResults.data)}
              lineColors={lineColors}
              dataFormatter={formatter('bytesFormat')}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default TrafficByVolumeWidget
