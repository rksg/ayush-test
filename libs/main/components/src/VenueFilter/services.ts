import { gql } from 'graphql-request'

import { dataApi }                             from '@acx-ui/analytics/services'
import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { PathNode }                            from '@acx-ui/utils'

export type Child = PathNode & { id: string }
interface Response {
  network: {
    hierarchyNode: { children: Child[] }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    venueFilter: build.query<
      Child[],
      Omit<AnalyticsFilter, 'path'>
    >({
      query: payload => ({
        document: gql`
          query NetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path, querySwitch: true) {
                children {
                  id
                  name
                }
              }
            }
          }
        `,
        variables: {
          path: defaultNetworkPath,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'DASHBOARD_NETWORK_FILTER' }],
      transformResponse: (response: Response) =>
        response.network.hierarchyNode.children
    })
  })
})

export const { useVenueFilterQuery } = api
