import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  AnalyticsFilter,
  defaultNetworkPath,
  NetworkPath,
  PathNode
} from '@acx-ui/analytics/utils'

type NetworkData = PathNode & { path: NetworkPath, incidentSeverity? : number }
export type ApOrSwitch = {
  path: NetworkPath
  name: string
  mac: string
  incidentSeverity: number
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
      Omit<AnalyticsFilter, 'path'>
    >({
      query: payload => ({
        document: gql`
          query NetworkHierarchy(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path, querySwitch: true) {
                type
                name
                path {
                  type
                  name
                }
                children {
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
          end: payload.endDate
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_FILTER' }],
      transformResponse: (response: Response) =>
        response.network.hierarchyNode.children 
    })
  })
})

export const { useNetworkFilterQuery } = api
