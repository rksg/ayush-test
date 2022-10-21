import { RefCallback } from 'react'

import ReactECharts   from 'echarts-for-react'
import { unitOfTime } from 'moment-timezone'

import { Incident, TimeSeriesData } from '@acx-ui/analytics/utils'

export type BufferConfig = {
  value: number;
  unit: unitOfTime.Base;
}

export type BufferType = { front: BufferConfig, back: BufferConfig }

export type TimeSeriesChartResponse = {
  relatedIncidents?: Incident[],
} & Record<string, TimeSeriesData>

export type TimeSeriesChartProps = {
  chartRef: RefCallback<ReactECharts>
  data: TimeSeriesChartResponse
  incident: Incident
  buffer: BufferType
}
