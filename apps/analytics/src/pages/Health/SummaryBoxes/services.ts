import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/analytics/services'
import { NetworkPath } from '@acx-ui/analytics/utils'

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
  path: NetworkPath
  start: string
  end: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    summary: build.query<SummaryData, RequestPayload>({
      query: payload => ({
        document: gql`
          query Summary($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $granularity: String) {
            timeSeries(
              path: $path,
              start: $start,
              end: $end,
              granularity: $granularity
            ) { connectionSuccessAndAttemptCount }
            avgTTC: network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
              incidentCharts: timeSeries(granularity: $granularity) {
                ttc: timeToConnect
              }
            }}
          }`,
        variables: {
          ...payload,
          granularity: 'all'
        }
      })
    })
  })
})

export const { useSummaryQuery } = api
