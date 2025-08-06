import { gql } from 'graphql-request'

import { getFilterPayload }     from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

import { IdentityFilter } from '../types'

type SLA = [number, number] | [null, null]

export interface IdentityHealthData {
  timeToConnectSLA: SLA
  clientThroughputSLA: SLA
}

type Response = { network: { hierarchyNode: { health: IdentityHealthData[] } } }

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    IdentityHealth: build.query<
      IdentityHealthData[],
      AnalyticsFilter & IdentityFilter
    >({
      query: (payload) => ({
        document: gql`
          query IdentityHealth(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $filter: FilterInput
            $identityFilter: IdentityFilter
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                health(filter: $identityFilter) {
                  timeToConnectSLA
                  clientThroughputSLA
                }
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
      transformResponse: (response: Response) => response.network.hierarchyNode.health
    })
  })
})

export const { useIdentityHealthQuery } = api
