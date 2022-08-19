import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi } from '@acx-ui/analytics/services'
import {
  AnalyticsFilter,
  incidentCodes,
  NetworkPath,
  PathNode
} from '@acx-ui/analytics/utils'

type NetworkData = PathNode & { path: NetworkPath }
export type ApOrSwitch = {
  path: NetworkPath,
  name: string,
  mac: string,
  incidentSeverity: number
}
type ApsOrSwictes = { aps?: ApOrSwitch[], switches?: ApOrSwitch[] }
type Child = ApsOrSwictes & NetworkData
export type NetworkHierarchy = NetworkData & { children: Child[] }
interface Response <NetworkHierarchy> {
  network: {
    hierarchyNode: NetworkHierarchy
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkFilter: build.query<
    NetworkHierarchy,
      Omit<AnalyticsFilter, 'path'>
    >({
      query: (payload) => ({
        document: gql`
          query Network(
            $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]
          ) {
            network(start: $start, end: $end, code: $code) {
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
                    incidentSeverity
                  }
                  switches {
                    name
                    mac
                    incidentSeverity
                  }
                }
              }
            }
          }
        `,
        variables: {
          path: [{ type: 'network', name: 'Network' }],
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes
        }
      }),
      providesTags: [{ type: 'Monitoring', id: 'ANALYTICS_NETWORK_FILTER' }],
      transformResponse: (response: Response<NetworkHierarchy>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useNetworkFilterQuery } = api
