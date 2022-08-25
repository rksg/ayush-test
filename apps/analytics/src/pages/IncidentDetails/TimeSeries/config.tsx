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
  chart?: (incident: Incident, data: ChartsData) => any
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
    chart: (incident, data) => <IncidentChart incident={incident} data={data}/>
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
    chart: (incident, data) => <ClientCountChart incident={incident} data={data} />
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
    chart: (incident, data) => <AttemptAndFailureChart incident={incident} data={data}/>
  }
}
