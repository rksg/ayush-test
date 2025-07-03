import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { AnalyticsFilter }  from '@acx-ui/utils'

export interface TrafficData {
  userRxTraffic: number
  userTxTraffic: number
}

type Response = { network: { hierarchyNode: TrafficData } }

type Payload = AnalyticsFilter

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Traffic: build.query<
      TrafficData,
      Payload
    >({
      query: (payload) => ({
        document: gql`
          query Traffic(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput
            ) {
            network(start: $start, end: $end, filter : $filter) {
              hierarchyNode(path: $path) {
                userRxTraffic: userTraffic(direction: "rx")
                userTxTraffic: userTraffic(direction: "tx")
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
      transformResponse: (response: Response) => response.network.hierarchyNode
    })
  })
})

export const { useTrafficQuery } = api
