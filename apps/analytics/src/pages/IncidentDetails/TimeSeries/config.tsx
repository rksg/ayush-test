import { Incident } from '@acx-ui/analytics/utils'

import attemptAndFailureChart from './charts/AttemptAndFailureChart'
import clientCountChart       from './charts/ClientCountChart'
import failureChart           from './charts/FailureChart'
import rssQualityByClientsChart from './charts/RssQualityByClientsChart'

import type { TimeSeriesChartProps } from './types'

interface TimeSeriesChart {
  query: (incident: Incident) => string,
  chart: (props: TimeSeriesChartProps) => JSX.Element
}

export enum TimeSeriesChartTypes {
  FailureChart,
  ClientCountChart,
  AttemptAndFailureChart,
  RssQualityByClientsChart
}

export const timeSeriesCharts: Readonly<Record<TimeSeriesChartTypes, TimeSeriesChart>> = {
  [TimeSeriesChartTypes.FailureChart]: failureChart,
  [TimeSeriesChartTypes.ClientCountChart]: clientCountChart,
  [TimeSeriesChartTypes.AttemptAndFailureChart]: attemptAndFailureChart,
  [TimeSeriesChartTypes.RssQualityByClientsChart]: rssQualityByClientsChart
}
