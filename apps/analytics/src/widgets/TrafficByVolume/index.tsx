import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useGlobalFilter }                   from '@acx-ui/analytics/utils'
import { Card }                              from '@acx-ui/components'
import { MultiLineTimeSeriesChart }          from '@acx-ui/components'
import { cssStr }                            from '@acx-ui/components'
import type { MultiLineTimeSeriesChartData } from '@acx-ui/components'

import {
  useTrafficByVolumeQuery,
  TrafficByVolumeData
} from './services'
import * as UI from './styledComponents'

const seriesMapping = [
  { key: 'totalTraffic_all', name: 'All Radios' },
  { key: 'totalTraffic_24', name: '2.4 GHz' },
  { key: 'totalTraffic_5', name: '5 GHz' },
  { key: 'totalTraffic_6', name: '6 GHz' }
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
  const { data, error, isLoading } = useTrafficByVolumeQuery(filters)

  if (isLoading) return <div data-testid='loading'>loading</div>
  if (error) return <div data-testid='error'>{JSON.stringify(error)}</div>

  return (
    <Card
      title={'Traffic by Volume'}
    >
      <UI.ChartWrapper>
        <AutoSizer>
          {({ height, width }) => (
            <MultiLineTimeSeriesChart
              style={{ width, height }}
              data={getSeriesData(data)}
              lineColors={lineColors}
            />
          )}
        </AutoSizer>
      </UI.ChartWrapper>
    </Card>
  )
}

export default TrafficByVolumeWidget
