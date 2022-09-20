import { gql } from 'graphql-request'

import { Incident, codeToFailureTypeMap } from '@acx-ui/analytics/utils'

import { AttemptAndFailureChart } from './charts/AttemptAndFailureChart'
import { ClientCountChart }       from './charts/ClientCountChart'
import { FailureChart }           from './charts/FailureChart'
import { ChartsData }             from './services'

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
  [TimeSeriesChartTypes.FailureChart]: {
    query: (incident) => gql`
      failureChart: timeSeries(granularity: $granularity) {
        time
        ${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}:
          apConnectionFailureRatio(
            metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
      }
    `,
    chart: FailureChart
  },
  [TimeSeriesChartTypes.ClientCountChart]: {
    query: () => gql`
      clientCountChart: timeSeries(granularity: $granularity) {
        time
        newClientCount: connectionAttemptCount
        impactedClientCount: impactedClientCountByCode(filter: {code: $code})
        connectedClientCount
      }
    `,
    chart: ClientCountChart
  },
  [TimeSeriesChartTypes.AttemptAndFailureChart]: {
    query: (incident) => gql`
      attemptAndFailureChart: timeSeries(granularity: $granularity) {
        time
        failureCount(
          metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
        totalFailureCount: failureCount
        attemptCount(
          metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
      }
    `,
    chart: AttemptAndFailureChart
  }
}
