import { RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'

import { Incident } from '@acx-ui/analytics/utils'

export type TimeSeriesChartResponse = {
  relatedIncidents?: Incident[],
  rssDistribution?: DistributionChartProps[]
} & Record<string, Record<string, number[] | string[]>>

export type DistributionChartProps = { [key: string]: number }

export type TimeSeriesChartProps = {
  chartRef: RefCallback<ReactECharts>,
  data: TimeSeriesChartResponse,
  incident: Incident
}
