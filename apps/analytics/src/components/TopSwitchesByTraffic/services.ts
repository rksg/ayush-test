import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type SwitchesByTrafficData = {
  name: string
  Received: number
  Transmitted: number
}

interface Response <SwitchesByTrafficData> {
  network: {
    hierarchyNode: {
      topNSwitchesByTraffic: SwitchesByTrafficData[]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    TopSwitchesByTraffic: build.query<
      SwitchesByTrafficData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesByTraffic(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $filter: FilterInput
          ) {
            network(start: $start, end: $end,filter : $filter) {
              hierarchyNode(path: $path) {
                topNSwitchesByTraffic (n: 5) {
                  name,
                  mac,
                  Received: totalTraffic(direction: "rx"),
                  Transmitted: totalTraffic(direction: "tx")
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<SwitchesByTrafficData>) =>
        response.network.hierarchyNode.topNSwitchesByTraffic
    })
  })
})

export const { useTopSwitchesByTrafficQuery } = api
