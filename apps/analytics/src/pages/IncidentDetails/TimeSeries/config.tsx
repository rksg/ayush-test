import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'

import { AttemptAndFailureChart } from './charts/AttemptAndFailureChart'
import { ClientCountChart }       from './charts/ClientCountChart'
import { IncidentChart }          from './charts/IncidentChart'
import { ChartsData }             from './services'

export const codeToFailureTypeMap = {
  'ttc': 'ttc',
  'radius-failure': 'radius',
  'eap-failure': 'eap',
  'dhcp-failure': 'dhcp',
  'auth-failure': 'auth',
  'assoc-failure': 'assoc',
  'p-cov-clientrssi-low': 'rss',
  'p-load-sz-cpu-load': 'sz-cpu-load',
  'i-net-time-future': 'time-future',
  'i-net-time-past': 'time-past',
  'i-apserv-downtime-high': 'ap-sz-conn-failure',
  'i-net-sz-net-latency': 'sz-net-latency',
  'i-apserv-high-num-reboots': 'ap-reboot',
  'i-apserv-continuous-reboots': 'ap-reboot',
  // 'p-channeldist-suboptimal-plan-24g': 'channel-dist-24g',
  // 'p-channeldist-suboptimal-plan-50g-outdoor': 'channel-dist-50g',
  // 'p-channeldist-suboptimal-plan-50g-indoor': 'channel-dist-50g',
  'i-switch-vlan-mismatch': 'vlan-mismatch',
  'p-switch-memory-high': 'switch-memory-high',
  'i-switch-poe-pd': 'poe-pd',
  'i-apinfra-poe-low': 'ap-poe-low',
  'i-apinfra-wanthroughput-low': 'ap-wanthroughput-low'
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
        ${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}:
          apConnectionFailureRatio(metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
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
        failureCount(metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
        totalFailureCount: failureCount
        attemptCount(metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
      }
    `,
    chart: AttemptAndFailureChart
  }
}
