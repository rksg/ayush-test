import React from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { useTrafficByVolumeQuery } from '@acx-ui/analytics/services'
import {
  GlobalFilterContext,
  GlobalFilterProps,
  getDateFilter
}                                   from '@acx-ui/analytics/utils'
import { Card }                     from '@acx-ui/components'
import { MultiLineTimeSeriesChart } from '@acx-ui/components'
import { cssStr }                   from '@acx-ui/components'
import type { ChartData }           from '@acx-ui/components'

import * as UI from './styledComponents'

const seriesMapping = [
  { key: 'traffic_all', name: 'ALL' },
  { key: 'traffic_6', name: '6 GHz' },
  { key: 'traffic_5', name: '5 GHz' },
  { key: 'traffic_24', name: '2.4 GHz' }
]

export interface TrafficByVolumeData {
  time: [string]
  traffic_all: [number]
  traffic_6: [number]
  traffic_5: [number]
  traffic_24: [number]
}

export const getSeriesData = (data: TrafficByVolumeData) =>
  seriesMapping.map(({ key, name }) => ({
    name,
    data: data.time.map((t: string, index: number) =>
      [t, data[key as keyof TrafficByVolumeData][index]])
  }))

export function Content (props: GlobalFilterProps) {
  const { data, error, isLoading } = useTrafficByVolumeQuery({
    path: props.path,
    ...getDateFilter(props.dateFilter)
  })

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
              data={getSeriesData(data as unknown as TrafficByVolumeData) as ChartData[]}
              lineColors={[
                cssStr('--acx-accents-blue-30'),
                cssStr('--acx-accents-blue-50'),
                cssStr('--acx-accents-blue-70'),
                cssStr('--acx-primary-black')
              ]}
            />
          )}
        </AutoSizer>
      </UI.ChartWrapper>
    </Card>
  )
}

function TrafficByVolumeWidget () {
  return (
    <GlobalFilterContext.Consumer>
      {(props) => <Content {...props} />}
    </GlobalFilterContext.Consumer>
  )
}
export default TrafficByVolumeWidget
