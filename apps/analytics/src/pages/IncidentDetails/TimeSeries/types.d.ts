import { RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'

import { Incident, TimeSeriesData } from '@acx-ui/analytics/utils'

export type TimeSeriesChartResponse = {
  relatedIncidents?: Incident[],
} & Record<string, TimeSeriesData>

export type TimeSeriesChartProps = {
  chartRef: RefCallback<ReactECharts>,
  data: TimeSeriesChartResponse,
  incident: Incident
}
