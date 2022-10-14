import { Incident } from '@acx-ui/analytics/utils'

import attemptAndFailureChart   from './charts/AttemptAndFailureChart'
import clientCountChart         from './charts/ClientCountChart'
import failureChart             from './charts/FailureChart'
import rssQualityByClientsChart from './charts/RssQualityByClientsChart'
import apDisconnectionCountChart          from './charts/ApDisconnectionCountChart'
import downtimeEventTypeDistributionChart from './charts/DowntimeEventTypeDistributionChart'
import ttcByFailureTypeChart              from './charts/TtcByFailureTypeChart'
import ttcFailureChart                    from './charts/TtcFailureChart'

import type { TimeSeriesChartProps } from './types'

interface TimeSeriesChart {
  query: (incident: Incident) => string,
  chart: (props: TimeSeriesChartProps) => JSX.Element
}

export enum TimeSeriesChartTypes {
  FailureChart,
  ClientCountChart,
  AttemptAndFailureChart,
  RssQualityByClientsChart,
  TtcFailureChart,
  TtcByFailureTypeChart,
  ApDisconnectionCountChart,
  DowntimeEventTypeDistributionChart
}

export const timeSeriesCharts: Readonly<Record<TimeSeriesChartTypes, TimeSeriesChart>> = {
  [TimeSeriesChartTypes.FailureChart]: failureChart,
  [TimeSeriesChartTypes.ClientCountChart]: clientCountChart,
  [TimeSeriesChartTypes.AttemptAndFailureChart]: attemptAndFailureChart,
  [TimeSeriesChartTypes.RssQualityByClientsChart]: rssQualityByClientsChart,
  [TimeSeriesChartTypes.TtcFailureChart]: ttcFailureChart,
  [TimeSeriesChartTypes.TtcByFailureTypeChart]: ttcByFailureTypeChart,
  [TimeSeriesChartTypes.ApDisconnectionCountChart]: apDisconnectionCountChart,
  [TimeSeriesChartTypes.DowntimeEventTypeDistributionChart]: downtimeEventTypeDistributionChart
}
