import { gql } from 'graphql-request'
import moment  from 'moment-timezone'

import { dataApi } from '@acx-ui/analytics/services'
import {
  AnalyticsFilter,
  incidentCodes,
  PathNode
} from '@acx-ui/analytics/utils'

type NetworkData = PathNode & { path: PathNode[] }
type AP = {
  name: string,
  mac: string,
  incidentSeverity: number
}
type APs = { aps: AP[] }
type Child = APs & NetworkData
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
      AnalyticsFilter
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
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes
        }
      }),
      transformResponse: (response: Response<NetworkHierarchy>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useNetworkFilterQuery } = api
