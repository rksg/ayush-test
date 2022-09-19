import { gql } from 'graphql-request'

import { Incident, codeToFailureTypeMap } from '@acx-ui/analytics/utils'

import { AttemptAndFailureChart } from './charts/AttemptAndFailureChart'
import { ClientCountChart }       from './charts/ClientCountChart'
import { IncidentChart }          from './charts/IncidentChart'
import { ChartsData }             from './services'

export interface FailureChart {
  key: string,
  query: (incident: Incident) => string,
  chart?: ({ incident, data }: { incident: Incident, data: ChartsData }) => JSX.Element
}

export const failureCharts: Readonly<Record<string, FailureChart>> = {
  incidentChart: {
    key: 'incident',
    query: (incident) => gql`
      incidentCharts: timeSeries(granularity: $granularity) {
        time
        ${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}:
          apConnectionFailureRatio(
            metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
      }
    `,
    chart: IncidentChart
  },
  clientCountChart: {
    key: 'clientCount',
    query: () => gql`
      clientCountCharts: timeSeries(granularity: $granularity) {
        time
        newClientCount: connectionAttemptCount
        impactedClientCount: impactedClientCountByCode(filter: {code: $code})
        connectedClientCount
      }
    `,
    chart: ClientCountChart
  },
  attemptAndFailureChart: {
    key: 'attemptAndFailure',
    query: (incident) => gql`
      attemptAndFailureCharts: timeSeries(granularity: $granularity) {
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
