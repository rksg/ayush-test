import { gql } from 'graphql-request'

import { getFilterPayload }     from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

export type HierarchyNodeData = {
  topNSwitchesByErrors: TopSwitchesByErrorData[]
}
export type TopSwitchesByErrorData = {
  name: string
  mac: string
  serial: string
  inErr: number
  outErr: number
}

interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    TopSwitchesByError: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TopSwitchesByErrorWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!,$filter: FilterInput) {
          network(end: $end, start: $start, filter : $filter) {
            hierarchyNode(path: $path) {
              topNSwitchesByErrors(n: $n) {
                name
                mac
                serial
                inErr
                outErr
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
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopSwitchesByErrorQuery } = api
