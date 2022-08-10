import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import { IncidentDetailsProps } from '../types'

export interface IncidentCharts {
  time: string[]
  failure: number[]
}

export type ClientCountCharts = {
  connectedClientCount: number[]
  impactedClientCount: number[]
  newClientCount: number[]
  time: string[]
}

export interface AttemptAndFailureCharts {
  time: string[]
  failureCount: number[]
  totalFailureCount: number[]
  attemptCount: number[]
}

export interface RelatedIncidents {
  id: string
  severity: number
  code: string
  startTime: string
  endTime: string
}

export interface RequestPayload {
  incident: IncidentDetailsProps
}

interface Response <TimeSeriesData> {
  incident: Record<string, ClientCountCharts>
}

export interface ChartsData {
  unit: string
}


export const Api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Charts: build.query<
      Record<string, ChartsData>,
      RequestPayload
    >({
      query: (payload) => ({
        document: gql`
          query Network($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $granularity: String) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                incidentCharts: timeSeries(granularity: $granularity) {
                  time
                  radius: apConnectionFailureRatio(metric: "radius")
                }
                relatedIncidents: incidents(filter: {code: ["radius-failure"]}) {
                  id
                  severity
                  code
                  startTime
                  endTime
                }
                clientCountCharts: timeSeries(granularity: $granularity) {
                  time
                  newClientCount: connectionAttemptCount
                  impactedClientCount: impactedClientCountByCode(filter: {code: "radius-failure"})
                  connectedClientCount
                }
                attemptAndFailureCharts: timeSeries(granularity: $granularity) {
                  time
                  failureCount(metric: "radius")
                  totalFailureCount: failureCount
                  attemptCount(metric: "radius")
                }
              }
            }
          }
        `
      })
    })
  })
})

export const { useChartsQuery } = Api






















// export const incidentChartsApi = dataApi.injectEndpoints({
//   endpoints: (build) => ({
//     incidentCharts: build.query<
//       IncidentCharts,
//       RequestPayload
//     >({
//       query: (payload) => ({
//         document: gql`
//           query IncidentCharts($granularity: String, $metric: String) {
//             incidentCharts: timeSeries(granularity: $granularity) {
//               time
//               $metric: apConnectionFailureRatio(metric: $metric)
//             }
//           }
//         `,
//         variables: {
//           id: payload.id
//         }
//       }),
//       transformResponse : (response: { incidentCharts: IncidentCharts }) => response.incidentCharts
//     })
//   })
// })

// export const { useIncidentChartsQuery } = incidentChartsApi

// export const clientCountChartsApi = dataApi.injectEndpoints({
//   endpoints: (build) => ({
//     clientCountChart: build.query<
//       ClientCountCharts,
//       RequestPayload
//     >({
//       query: (payload) => ({
//         document: gql`
//           clientCountCharts: timeSeries(granularity:$granularity) {
//             time
//             newClientCount: connectionAttemptCount,
//             impactedClientCount: impactedClientCountByCode(filter:{code: "code"}),
//             connectedClientCount
//           }
//         `,
//         variables: {
//           id: payload.id
//         }
//       }),
//       transformResponse : (response: { clientCountChart: ClientCountCharts }) => response.clientCountChart
//     })
//   })
// })

// export const { useClientCountChartQuery } = clientCountChartsApi

// export const attemptAndFailureChartsApi = dataApi.injectEndpoints({
//   endpoints: (build) => ({
//     attemptAndFailureCharts: build.query<
//       AttemptAndFailureCharts, RequestPayload
//     >({
//       query: (payload) => ({
//         document: gql`
//           query AttemptAndFailureCharts($granularity: String, $metric: String) {
//             attemptAndFailureCharts: timeSeries(granularity: $granularity) {
//               time
//               failureCount(metric: $metric)
//               totalFailureCount: failureCount
//               attemptCount(metric: $metric)
//             }
//           }
//         `,
//         variables: payload
//       }),
//       transformResponse : (response: { attemptAndFailureCharts: AttemptAndFailureCharts }) => response.attemptAndFailureCharts
//     })
//   })
// })

// export const { useAttemptAndFailureChartsQuery } = attemptAndFailureChartsApi

// export const relatedIncidentsApi = dataApi.injectEndpoints({
//   endpoints: (build) => ({
//     relatedIncidents: build.query({
//       query: (payload) => ({
//         document: gql`
//           query RelatedIncidents($code: String) {
//             relatedIncidents: incidents (filter: {code: [$code]}) {
//               id
//               severity
//               code
//               startTime
//               endTime
//             }
//           }
//         `,
//         variables: {
//           code: payload
//         }
//       }),
//       transformResponse : (response: { relatedIncidents: RelatedIncidents }) => response.relatedIncidents
//     })
//   })
// })

// export const { useRelatedIncidentsQuery } = relatedIncidentsApi
