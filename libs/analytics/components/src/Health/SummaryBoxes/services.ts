import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/store'
import type { PathFilter } from '@acx-ui/utils'

export interface SummaryData {
  timeSeries: {
    connectionSuccessAndAttemptCount: [[number, number]]
  }
  avgTTC: {
    hierarchyNode: {
      incidentCharts: {
        ttc: [number]
      }
    }
  }
}

export interface RequestPayload {
  filter: PathFilter
  start: string
  end: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    summary: build.query<SummaryData, RequestPayload>({
      query: payload => ({
        document: gql`
          query HealthSummary(
          $path: [HierarchyNodeInput],
          $start: DateTime, 
          $end: DateTime, 
          $granularity: String,
          $filter: FilterInput
          ) {
            timeSeries(
              path: $path,
              start: $start,
              end: $end,
              granularity: $granularity
            ) { connectionSuccessAndAttemptCount }
            avgTTC: network(start: $start, end: $end, filter: $filter) {
            hierarchyNode(path: $path) {
              incidentCharts: timeSeries(granularity: $granularity) {
                ttc: timeToConnect
              }
            }}
          }`,
        variables: {
          ...payload,
          path: [{ type: 'network', name: 'Network' }],
          granularity: 'all'
        }
      })
    })
  })
})

export const { useSummaryQuery } = api
