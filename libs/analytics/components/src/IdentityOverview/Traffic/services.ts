import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { AnalyticsFilter }  from '@acx-ui/utils'

import { IdentityFilter } from '../types'

export interface TrafficData {
  userRxTraffic: number
  userTxTraffic: number
}

type Response = { network: { hierarchyNode: TrafficData } }


export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    Traffic: build.query<TrafficData, AnalyticsFilter & IdentityFilter>({
      query: (payload) => ({
        document: gql`
          query Traffic(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $filter: FilterInput
            $identityFilter: IdentityFilter
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                userRxTraffic: userTraffic(
                  direction: "rx"
                  filter: $identityFilter
                )
                userTxTraffic: userTraffic(
                  direction: "tx"
                  filter: $identityFilter
                )
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          identityFilter: payload.identityFilter,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response) => response.network.hierarchyNode
    })
  })
})

export const { useTrafficQuery } = api
