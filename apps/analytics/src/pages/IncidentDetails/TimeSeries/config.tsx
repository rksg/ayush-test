import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'

import { AttemptAndFailureChart } from './charts/AttemptAndFailureChart'
import { ClientCountChart }       from './charts/ClientCountChart'
import { IncidentChart }          from './charts/IncidentChart'
import { ChartsData }             from './services'

export const codeToFailureTypeMap = {
  'radius-failure': 'radius',
  'eap-failure': 'eap',
  'dhcp-failure': 'dhcp',
  'auth-failure': 'auth',
  'assoc-failure': 'assoc'
}

export interface FailureChart {
  key: string,
  query: (incident: Incident) => string,
  chart?: ({ incident, data }: { incident: Incident, data: ChartsData }) => JSX.Element
}

export const failureCharts: Readonly<Record<string, FailureChart>> = {
  incidentCharts: {
    key: 'incident',
    query: (incident) => gql`
      incidentCharts: timeSeries(granularity: $granularity) {
        time
        ${codeToFailureTypeMap[incident.code]}:
          apConnectionFailureRatio(metric: "${codeToFailureTypeMap[incident.code]}")
      }
    `,
    chart: IncidentChart
  },
  relatedIncidents: {
    key: 'relatedIncidents',
    query: () => gql`
       relatedIncidents: incidents(filter: {code: [$code]}) {
        id
        severity
        code
        startTime
        endTime
      }
    `
  },
  clientCountCharts: {
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
  attemptAndFailureCharts: {
    key: 'attemptAndFailure',
    query: (incident) => gql`
      attemptAndFailureCharts: timeSeries(granularity: $granularity) {
        time
        failureCount(metric: "${codeToFailureTypeMap[incident.code]}")
        totalFailureCount: failureCount
        attemptCount(metric: "${codeToFailureTypeMap[incident.code]}")
      }
    `,
    chart: AttemptAndFailureChart
  }
}
