import { Incident } from '@acx-ui/analytics/utils'

import apDisconnectionCountChart          from './charts/ApDisconnectionCountChart'
import apPoeImpactChart                   from './charts/ApPoeImpactChart'
import apRebootBySystemChart              from './charts/ApRebootBySystemChart'
import apWanthroughputImpactChart         from './charts/ApWanthroughputImpactChart'
import attemptAndFailureChart             from './charts/AttemptAndFailureChart'
import clientCountChart                   from './charts/ClientCountChart'
import connectedClientsChartChart         from './charts/ConnectedClientsChart'
import downtimeEventTypeDistributionChart from './charts/DowntimeEventTypeDistributionChart'
import failureChart                       from './charts/FailureChart'
import rebootedAPsCountChart              from './charts/RebootedAPsCountChart'
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
