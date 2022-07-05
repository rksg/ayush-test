import React from 'react'

import { MultiLineTimeSeriesChartData }          from '@acx-ui/components'


export interface NetworkHistoryData {
  connectedClientCount: number[]
  impactedClientCount: number[]
  newClientCount: number[]
  time: string[]
}
export interface TrafficByVolumeData {
  time: string[]
  totalTraffic_all: number[]
  totalTraffic_6: number[]
  totalTraffic_5: number[]
  totalTraffic_24: number[]
}
export type TimeSeriesKey = keyof Omit<NetworkHistoryData, 'time'>  & keyof Omit<TrafficByVolumeData, 'time'>

export function getSeriesData(data: NetworkHistoryData | TrafficByVolumeData | null, 
  seriesMapping: Array<{ key: TimeSeriesKey, name: string }>): 
  MultiLineTimeSeriesChartData[] {
  if (!data) return []
  return seriesMapping.map(({ key , name }) => ({
    name,
    data: data.time.map((t: string, index: number) =>{
      return [t, data[key][index]]
    })
  }))
}
