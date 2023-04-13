import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

export interface ConnectionDrilldown {
    connectionDrilldown: {
        assocSuccessAndAttemptCount: [[number,number]],
        authSuccessAndAttemptCount: [[number,number]],
        eapSuccessAndAttemptCount: [[number,number]],
        radiusSuccessAndAttemptCount: [[number,number]],
        dhcpSuccessAndAttemptCount: [[number,number]],
    }
}
export interface TtcDrilldown {
  network: {
    hierarchyNode: {
      ttcDrilldown: {
        ttcByFailureTypes: {
          ttcByEap: [number];
          ttcByDhcp: [number];
          ttcByAuth: [number];
          ttcByAssoc: [number];
          ttcByRadius: [number];
        };
      };
    };
  };
}
export interface RequestPayload {
  path: NetworkPath
  start: string
  end: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    connectionDrilldown: build.query<ConnectionDrilldown, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query ConnectionDrilldown(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            connectionDrilldown: timeSeries(
              path: $path
              start: $start
              end: $end
              granularity: $granularity
            ) {
              assocSuccessAndAttemptCount
              authSuccessAndAttemptCount
              eapSuccessAndAttemptCount
              radiusSuccessAndAttemptCount
              dhcpSuccessAndAttemptCount
            }
          }
        `,
        variables: {
          ...payload,
          granularity: 'all'
        }
      })
    }),
    ttcDrilldown: build.query<TtcDrilldown, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query ConnectionDrilldown(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                ttcDrilldown: timeSeries(granularity: $granularity) {
                  ttcByFailureTypes {
                    ttcByEap
                    ttcByDhcp
                    ttcByAuth
                    ttcByAssoc
                    ttcByRadius
                  }
                }
              }
            }
          }
        `,
        variables: {
          ...payload,
          granularity: 'all'
        }
      })
    })
  })
})

export const { useConnectionDrilldownQuery, useTtcDrilldownQuery } = api


