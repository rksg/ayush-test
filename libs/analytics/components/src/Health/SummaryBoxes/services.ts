import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import type { NodesFilter } from '@acx-ui/utils'

export interface SummaryData {
  network: {
    timeSeries: {
      connectionSuccessAndAttemptCount: [[number, number]]
    }
    avgTTC: {
      incidentCharts: {
        ttc: [number]
      }
    }
  }
}

export interface RequestPayload {
  filter: NodesFilter
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
            network(start: $start, end: $end, filter: $filter) {
              timeSeries(
                path: $path,
                start: $start,
                end: $end,
                granularity: $granularity
              ) { connectionSuccessAndAttemptCount }
              avgTTC: hierarchyNode(path: $path) {
                incidentCharts: timeSeries(granularity: $granularity) {
                  ttc: timeToConnect
                }
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload),
          granularity: 'all'
        }
      })
    })
  })
})

export const { useSummaryQuery } = api
