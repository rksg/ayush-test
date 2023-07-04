import { gql } from 'graphql-request'

import { getFilterPayload, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'

export type HierarchyNodeData = {
  topNAppByTotalTraffic: TopAppsByTrafficData[]
}

export type TopAppsByTrafficData = {
    name: string
    applicationTraffic: number
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topAppsByTraffic: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TopAppsByTraffic($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $filter: FilterInput) {
          network(end: $end, start: $start, filter : $filter) {
            hierarchyNode(path: $path) {
              topNAppByTotalTraffic:topNApplicationByTraffic(n: $n, direction: "both") {
                name
                applicationTraffic
              }
            }
          }
        }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          n: 5,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>{
        return response.network.hierarchyNode
      }
    })
  })
})

export const { useTopAppsByTrafficQuery } = api
