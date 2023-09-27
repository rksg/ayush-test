import { gql }  from 'graphql-request'
import { find } from 'lodash'

import { getFilterPayload, getSelectedNodePath } from '@acx-ui/analytics/utils'
import { dataApi }                               from '@acx-ui/store'
import { NodesFilter }                           from '@acx-ui/utils'

export interface ConnectionDrilldown {
  network: {
    connectionDrilldown: {
        assocSuccessAndAttemptCount: [[number,number]],
        authSuccessAndAttemptCount: [[number,number]],
        eapSuccessAndAttemptCount: [[number,number]],
        radiusSuccessAndAttemptCount: [[number,number]],
        dhcpSuccessAndAttemptCount: [[number,number]],
    }
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
export interface ImpactedClients {
  network: {
    hierarchyNode: {
      impactedClients: ImpactedClient[];
    };
  };
}
export interface ImpactedClient {
  mac: string | string[]
  manufacturer: string | string[]
  ssid: string | string[]
  hostname: string | string[]
  username: string | string[]
}
export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
}

export interface PieChartPayload {
  filter: NodesFilter
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
  filter: NodesFilter,
  type: string,
  stageFilter: string
) => {
  const path = getSelectedNodePath(filter)
  const apNode = find(path, { type: 'AP' })
  switch (type) {
    case 'connectionFailure': {
      return apNode
        ? `wlans: topNSSIDbyConnFailure(n: 6, stage: "${stageFilter}") { key value }`
        : `nodes: topNNodebyConnFailure(n: 6, stage: "${stageFilter}") { key value name }
      wlans: topNSSIDbyConnFailure(n: 6, stage: "${stageFilter}") { key value }`
    }
    case 'ttc': {
      return apNode
        ? `wlans: topNSSIDbyAvgTTC(n: 6, stage: "${stageFilter}") { key value }`
        : `nodes: topNNodebyAvgTTC(n: 6, stage: "${stageFilter}") { key value name }
        wlans: topNSSIDbyAvgTTC(n: 6, stage: "${stageFilter}") { key value }`
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
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
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
          }
        `,
        variables: {
          ...payload,
          ...getFilterPayload(payload),
          granularity: 'all'
        }
      })
    }),
    ttcDrilldown: build.query<TtcDrilldown, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query TTCDrilldown(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
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
          ...getFilterPayload(payload),
          granularity: 'all'
        }
      })
    }),
    healthImpactedClients: build.query<
      ImpactedClients,
      RequestPayload & { field: string; topImpactedClientLimit: number; stage: string }
    >({
      query: (payload) => {
        const impactedClientQuery = (type : string, stage : string) => {
          return `impactedClients: ${type}(n: ${
            payload.topImpactedClientLimit + 1
          }, stage: "${stage}") {
                mac
                manufacturer
                ssid
                hostname
                username
              }`
        }
        return {
          document: gql`
            query Network(
              $path: [HierarchyNodeInput]
              $start: DateTime
              $end: DateTime
              $filter: FilterInput
            ) {
              network(start: $start, end: $end, filter: $filter) {
                hierarchyNode(path: $path) {
                  ${impactedClientQuery(payload.field, payload.stage)}
                }
              }
            }
          `,
          variables: {
            ...payload,
            ...getFilterPayload(payload)
          }
        }
      }
    }),

    pieChart: build.query<ImpactedNodesAndWlans, PieChartPayload>({
      query: payload => {
        const { filter, queryType, queryFilter } = payload
        const innerQuery = pieChartQuery(filter, queryType, queryFilter)
        return ({
          document: gql`
            query Network(
              $path: [HierarchyNodeInput]
              $start: DateTime
              $end: DateTime
              $filter: FilterInput
            ) {
              network(start: $start, end: $end, filter: $filter) {
                hierarchyNode(path: $path) {
                  ${innerQuery}
                }
              }
            }
          `,
          variables: {
            ...getFilterPayload(payload),
            path: getSelectedNodePath(payload.filter),
            start: payload.start,
            end: payload.end
          }
        })
      }
    })
  })
})

export const {
  useConnectionDrilldownQuery,
  useTtcDrilldownQuery,
  useHealthImpactedClientsQuery,
  usePieChartQuery
} = api

