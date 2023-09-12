import { gql } from 'graphql-request'

import { getFilterPayload }     from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

export type HierarchyNodeData = {
  topNSSIDByTraffic: TopSSIDsByTraffic[]
  topNSSIDByClient: TopSSIDsByClient[]
}

export type TopSSIDsByTraffic = {
    name: string
    userTraffic: number
}
export type TopSSIDsByClient = {
  name: string
  clientCount: number
}
interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    TopSSIDsByNetwork: build.query<
      HierarchyNodeData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query TopSSIDsWidget($path: [HierarchyNodeInput],
          $start: DateTime, $end: DateTime, $n: Int!, $filter: FilterInput) {
          network(end: $end, start: $start,filter : $filter) {
            hierarchyNode(path: $path) {
              topNSSIDByTraffic: topNSSIDByTraffic(n: $n) {
                name
                userTraffic
              }
              topNSSIDByClient: topNSSIDByClient(n: $n) {
                name
                clientCount
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

export const { useTopSSIDsByNetworkQuery } = api
