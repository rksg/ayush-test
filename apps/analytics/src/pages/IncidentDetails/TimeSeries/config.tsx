import { Incident } from '@acx-ui/analytics/utils'

import apDisconnectionCountChart          from './Charts/ApDisconnectionCountChart'
import apPoeImpactChart                   from './Charts/ApPoeImpactChart'
import apRebootBySystemChart              from './Charts/ApRebootBySystemChart'
import apWanthroughputImpactChart         from './Charts/ApWanthroughputImpactChart'
import attemptAndFailureChart             from './Charts/AttemptAndFailureChart'
import clientCountChart                   from './Charts/ClientCountChart'
import connectedClientsChartChart         from './Charts/ConnectedClientsChart'
import downtimeEventTypeDistributionChart from './Charts/DowntimeEventTypeDistributionChart'
import failureChart                       from './Charts/FailureChart'
import rebootedAPsCountChart              from './Charts/RebootedAPsCountChart'
import rssQualityByClientsChart           from './Charts/RssQualityByClientsChart'
import ttcByFailureTypeChart              from './Charts/TtcByFailureTypeChart'
import ttcFailureChart                    from './Charts/TtcFailureChart'

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
  DowntimeEventTypeDistributionChart,
  ApRebootBySystemChart,
  ConnectedClientsChart,
  RebootedApsCountChart,
  ApPoeImpactChart,
  ApWanThroughputImpactChart
}

export const timeSeriesCharts: Readonly<Record<TimeSeriesChartTypes, TimeSeriesChart>> = {
  [TimeSeriesChartTypes.FailureChart]: failureChart,
  [TimeSeriesChartTypes.ClientCountChart]: clientCountChart,
  [TimeSeriesChartTypes.AttemptAndFailureChart]: attemptAndFailureChart,
  [TimeSeriesChartTypes.RssQualityByClientsChart]: rssQualityByClientsChart,
  [TimeSeriesChartTypes.TtcFailureChart]: ttcFailureChart,
  [TimeSeriesChartTypes.TtcByFailureTypeChart]: ttcByFailureTypeChart,
  [TimeSeriesChartTypes.ApDisconnectionCountChart]: apDisconnectionCountChart,
  [TimeSeriesChartTypes.DowntimeEventTypeDistributionChart]: downtimeEventTypeDistributionChart,
  [TimeSeriesChartTypes.ApRebootBySystemChart]: apRebootBySystemChart,
  [TimeSeriesChartTypes.ConnectedClientsChart]: connectedClientsChartChart,
  [TimeSeriesChartTypes.RebootedApsCountChart]: rebootedAPsCountChart,
  [TimeSeriesChartTypes.ApPoeImpactChart]: apPoeImpactChart,
  [TimeSeriesChartTypes.ApWanThroughputImpactChart]: apWanthroughputImpactChart
}
