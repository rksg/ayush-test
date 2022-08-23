import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

export type SwitchesByTrafficData = {
  name: string
  Received: number
  Transmited: number
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
    SwitchesByTraffic: build.query<
      SwitchesByTrafficData[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query SwitchesByTraffic(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNSwitchesByTraffic (n: 5) {
                  name,
                  Received: rx,
                  Transmited: tx
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      transformResponse: (response: Response<SwitchesByTrafficData>) =>
        response.network.hierarchyNode.topNSwitchesByTraffic
    })
  })
})

export const { useSwitchesByTrafficQuery } = api
