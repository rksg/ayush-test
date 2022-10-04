import { Incident } from '@acx-ui/analytics/utils'

import attemptAndFailureChart from './charts/AttemptAndFailureChart'
import clientCountChart       from './charts/ClientCountChart'
import failureChart           from './charts/FailureChart'
import { ChartsData }         from './services'

interface TimeSeriesChart {
  query: (incident: Incident) => string,
  chart?: ({ incident, data }: { incident: Incident, data: ChartsData }) => JSX.Element
}

export enum TimeSeriesChartTypes {
  FailureChart,
  ClientCountChart,
  AttemptAndFailureChart
}

export const timeSeriesCharts: Readonly<Record<TimeSeriesChartTypes, TimeSeriesChart>> = {
  [TimeSeriesChartTypes.FailureChart]: failureChart,
  [TimeSeriesChartTypes.ClientCountChart]: clientCountChart,
  [TimeSeriesChartTypes.AttemptAndFailureChart]: attemptAndFailureChart
}
