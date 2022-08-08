import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

import { calcGranularity } from 'apps/analytics/src/components/NetworkHistory/services'
import { GlobalFilter, incidentCodes } from '@acx-ui/analytics/utils'

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
  granularity: string
  code: string
  metric: string
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}

export const incidentChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentCharts: build.query<
      IncidentCharts,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
          query IncidentCharts($granularity: String, $metric: String) {
            incidentCharts: timeSeries(granularity: $granularity) {
              time
              $metric: apConnectionFailureRatio(metric: $metric)
            }
          }
        `,
        variables: {
          granularity: calcGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse : (response: { incidentCharts: IncidentCharts }) => response.incidentCharts
    })
  })
})

export const { useIncidentChartsQuery } = incidentChartsApi

export const Api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientCountChart: build.query<
      ClientCountCharts,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
            query ClientCountCharts(
            $path:[HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $granularity: String,
            $code: [String]
            ){
            network(start: $start end: $end){
                hierarchyNode(path:$path){
                clientCountCharts: timeSeries(granularity:$granularity){
                    time
                    newClientCount: connectionAttemptCount
                    impactedClientCount: impactedClientCountBySeverity(
                        filter:{code: $code}
                    )
                    connectedClientCount
                }
                }
            }
            }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calcGranularity(payload.startDate, payload.endDate),
          code: incidentCodes
        }
      }),
      transformResponse: (response: Response<ClientCountCharts>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useClientCountChartQuery } = Api

export const clientCountChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientCountCharts: build.query<
      ClientCountCharts,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
          query ClientCountCharts(
            $path:[HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $granularity: String,
            $code: [String]
          ) {
            network(start: $start end: $end){
              hierarchyNode(path:$path){
                clientCountCharts: timeSeries(granularity: $granularity) {
                  time
                    newClientCount: connectionAttemptCount
                    impactedClientCount: impactedClientCountBySeverity(
                        filter:{code: $code}
                    )
                    connectedClientCount
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calcGranularity(payload.startDate, payload.endDate),
          code: incidentCodes
        }
      }),
      transformResponse : (response: Response<ClientCountCharts>) => response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useClientCountChartsQuery } = clientCountChartsApi

export const attemptAndFailureChartsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    attemptAndFailureCharts: build.query<
      AttemptAndFailureCharts, RequestPayload
    >({
      query: (payload) => ({
        document: gql`
          query AttemptAndFailureCharts($granularity: String, $metric: String) {
            attemptAndFailureCharts: timeSeries(granularity: $granularity) {
              time
              failureCount(metric: $metric)
              totalFailureCount: failureCount
              attemptCount(metric: $metric)
            }
          }
        `,
        variables: payload
      }),
      transformResponse : (response: { attemptAndFailureCharts: AttemptAndFailureCharts }) => response.attemptAndFailureCharts
    })
  })
})

export const { useAttemptAndFailureChartsQuery } = attemptAndFailureChartsApi

export const relatedIncidentsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    relatedIncidents: build.query({
      query: (payload) => ({
        document: gql`
          query RelatedIncidents($code: String) {
            relatedIncidents: incidents (filter: {code: [$code]}) {
              id
              severity
              code
              startTime
              endTime
            }
          }
        `,
        variables: {
          code: payload
        }
      }),
      transformResponse : (response: { relatedIncidents: RelatedIncidents }) => response.relatedIncidents
    })
  })
})

export const { useRelatedIncidentsQuery } = relatedIncidentsApi

export type NetworkHistoryData = {
  connectedClientCount: number[]
  impactedClientCount: number[]
  newClientCount: number[]
  time: string[]
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}
