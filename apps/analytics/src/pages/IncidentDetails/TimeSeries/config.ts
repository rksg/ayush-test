import { gql }                              from 'graphql-request'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { Incident } from '@acx-ui/analytics/utils'

export const codeToFailureTypeMap = {
  'radius-failure': 'radius',
  'eap-failure': 'eap',
  'dhcp-failure': 'dhcp',
  'auth-failure': 'auth',
  'assoc-failure': 'assoc'
}

export interface FailureChart {
  key: string,
  title: MessageDescriptor,
  query: (incident: Incident) => string
}

export const failureCharts: Readonly<Record<string, FailureChart>> = {
  incidentCharts: {
    key: 'incident',
    title: defineMessage({ defaultMessage: 'code' }),
    query: (incident) => gql`
      incidentCharts: timeSeries(granularity: $granularity) {
        time
        ${codeToFailureTypeMap[incident.code]}:
          apConnectionFailureRatio(metric: "${codeToFailureTypeMap[incident.code]}")
      }
    `
  },
  relatedIncidents: {
    key: 'relatedIncidents',
    title: defineMessage({ defaultMessage: 'RELATED INCIDENTS' }),
    query: (incident) => gql`
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
    title: defineMessage({ defaultMessage: 'CLIENTS' }),
    query: (incident) => gql`
      clientCountCharts: timeSeries(granularity: $granularity) {
        time
        newClientCount: connectionAttemptCount
        impactedClientCount: impactedClientCountByCode(filter: {code: $code})
        connectedClientCount
      }
    `
  },
  attemptAndFailureCharts: {
    key: 'attemptAndFailure',
    title: defineMessage({ defaultMessage: 'FAILURES' }),
    query: (incident) => gql`
      attemptAndFailureCharts: timeSeries(granularity: $granularity) {
        time
        failureCount(metric: "${codeToFailureTypeMap[incident.code]}")
        totalFailureCount: failureCount
        attemptCount(metric: "${codeToFailureTypeMap[incident.code]}")
      }
    `
  }
}
