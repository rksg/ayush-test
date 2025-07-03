import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { AnalyticsFilter }  from '@acx-ui/utils'

interface HierarchyNodeData {
  topNApplicationByTraffic: {
    applicationTraffic: number
    name: string
  }[]
}

export type ApplicationsPayload = AnalyticsFilter & {
  n: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topNApplications: build.query<HierarchyNodeData, ApplicationsPayload>({
      query: (payload) => ({
        document: gql`
          query Network(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $n: Int!
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNApplicationByTraffic(n: $n) {
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
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: { network: { hierarchyNode: HierarchyNodeData } }) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopNApplicationsQuery } = api
