import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import type { NodesFilter } from '@acx-ui/utils'

export interface TrafficSummary {
  network: {
    hierarchyNode: {
      apTotalTraffic: number
      switchTotalTraffic: number
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
    traffic: build.query<TrafficSummary, RequestPayload>({
      query: payload => ({
        document: gql`
          query TrafficSummary(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                apTotalTraffic: totalTraffic
                switchTotalTraffic
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload)
        }
      })
    })
  })
})

export const { useTrafficQuery } = api
