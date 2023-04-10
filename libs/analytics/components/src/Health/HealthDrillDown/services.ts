import { gql }  from 'graphql-request'
import { find } from 'lodash'

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

export type PieChartPayload = {
  path: NetworkPath
  start: string
  end: string
  queryType: string
  queryFilter: string
}

export type ImpactedNodesAndWlans = {
  network: {
    hierarchyNode: {
      nodes?: Array<{ key: string, value: number, name: string | null }>,
      wlans: Array<{ key: string, value: number }>
    }
  }
}

export const pieChartQuery = (
  path: NetworkPath,
  type: string,
  filter: string
) => {
  const apNode = find(path, { type: 'AP' })
  switch (type) {
    case 'connectionFailure': {
      return apNode
        ? `wlans: topNSSIDbyConnFailure(n: 6, stage: "${filter}") { key value }`
        : `nodes: topNNodebyConnFailure(n: 6, stage: "${filter}") { key value name }
      wlans: topNSSIDbyConnFailure(n: 6, stage: "${filter}") { key value }`
    }
    case 'ttc': {
      return apNode
        ? `wlans: topNSSIDbyAvgTTC(n: 6, stage: "${filter}") { key value }`
        : `nodes: topNNodebyAvgTTC(n: 6, stage: "${filter}") { key value name }
        wlans: topNSSIDbyAvgTTC(n: 6, stage: "${filter}") { key value }`
    }
    default: {
      return ''
    }
  }
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
    }),
    pieChart: build.query<ImpactedNodesAndWlans, PieChartPayload>({
      query: payload => {
        const { path, queryType, queryFilter } = payload
        const innerQuery = pieChartQuery(path, queryType, queryFilter)
        return ({
          document: gql`
            query Network($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime) {
              network(start: $start, end: $end) {
                hierarchyNode(path: $path) {
                  ${innerQuery}
                    }
                  }
                }
          `,
          variables: {
            start: payload.start,
            end: payload.end,
            path: payload.path
          }
        })
      }
    })
  })
})

export const { useConnectionDrilldownQuery, useTtcDrilldownQuery, usePieChartQuery } = api


