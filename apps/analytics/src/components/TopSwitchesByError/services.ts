import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type HierarchyNodeData = {
  topNSwitchesByErrors: TopSwitchesByErrorData[]
}
export type TopSwitchesByErrorData = {
  name: string
  mac: string
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
          $start: DateTime, $end: DateTime, $n: Int!) {
          network(end: $end, start: $start) {
            hierarchyNode(path: $path) {
              topNSwitchesByErrors(n: $n) {
                name
                mac
                inErr
                outErr
              }
            }
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          n: 5
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopSwitchesByErrorQuery } = api
