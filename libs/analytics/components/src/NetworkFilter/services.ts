import { gql } from 'graphql-request'

import { AnalyticsFilter, defaultNetworkPath } from '@acx-ui/analytics/utils'
import { dataApi }                             from '@acx-ui/store'
import { NetworkPath, PathNode }               from '@acx-ui/utils'

type NetworkData = PathNode & { id:string, path: NetworkPath }
type NetworkHierarchyFilter = AnalyticsFilter & { shouldQuerySwitch? : Boolean }

export type ApOrSwitch = {
  path?: NetworkPath
  name: string
  mac: string
}
export type ApsOrSwitches = { aps?: ApOrSwitch[], switches?: ApOrSwitch[] }
export type Child = NetworkData & ApsOrSwitches
interface Response {
  network: {
    hierarchyNode: { children: Child[] }
  }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkFilter: build.query<
      Child[],
      Omit<NetworkHierarchyFilter, 'path'>
    >({
      query: payload => ({
        document: gql`
          query NetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $querySwitch: Boolean
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path, querySwitch: $querySwitch) {
                type
                name
                path {
                  type
                  name
                }
                children {
                  id
                  type
                  name
                  path {
                    type
                    name
                  }
                  aps {
                    name
                    mac
                  }
                  switches {
                    name
                    mac
                  }
                }
              }
            }
          }
        `,
        variables: {
          path: defaultNetworkPath,
          start: payload.startDate,
          end: payload.endDate,
          querySwitch: payload.shouldQuerySwitch
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_FILTER' }],
      transformResponse: (response: Response) =>
        response.network.hierarchyNode.children
    })
  })
})

export const { useNetworkFilterQuery } = api
