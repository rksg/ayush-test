import { RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'

import { Incident } from '@acx-ui/analytics/utils'

export type TimeSeriesChartResponse = {
  relatedIncidents?: Incident[],
} & Record<string, Record<string, number[] | string[] | Record<string, number[] | string[]>>>

export type TimeSeriesChartProps = {
  chartRef: RefCallback<ReactECharts>,
  data: TimeSeriesChartResponse,
  incident: Incident
}
