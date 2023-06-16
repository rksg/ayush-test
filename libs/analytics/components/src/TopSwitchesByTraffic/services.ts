import { gql } from 'graphql-request'

import { getFilterPayload, AnalyticsFilter } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'

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
                  Transmitted: totalTraffic(direction: "tx"),
                  serial
                }
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<SwitchesByTrafficData>) =>
        response.network.hierarchyNode.topNSwitchesByTraffic
    })
  })
})

export const { useTopSwitchesByTrafficQuery } = api
