import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { AnalyticsFilter }  from '@acx-ui/utils'

import { IdentityFilter } from '../types'

interface HierarchyNodeData {
  topNApplicationByTraffic: {
    applicationTraffic: number
    name: string
  }[]
}

export type ApplicationsPayload = AnalyticsFilter &
  IdentityFilter & {
    n: number
  }

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topNApplications: build.query<HierarchyNodeData, ApplicationsPayload>({
      query: (payload) => ({
        document: gql`
          query Network(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $n: Int!
            $identityFilter: IdentityFilter
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNApplicationByTraffic(n: $n, filter: $identityFilter) {
                  applicationTraffic
                  name
                }
              }
            }
          }
          `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          n: payload.n,
          identityFilter: payload.identityFilter,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: { network: { hierarchyNode: HierarchyNodeData } }) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopNApplicationsQuery } = api
