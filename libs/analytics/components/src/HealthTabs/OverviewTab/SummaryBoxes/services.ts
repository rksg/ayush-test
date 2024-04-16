import { gql } from 'graphql-request'

import { getFilterPayload, incidentsToggle } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'
import type { NodesFilter }                  from '@acx-ui/utils'

export interface IncidentSummary {
  network: {
    hierarchyNode: {
      apIncidentCount: number
      switchIncidentCount: number
    }
  }
}

export interface UtilizationSummary {
  network: {
    hierarchyNode: {
      portCount: number
      totalPortCount: number
      avgPerAPClientCount: number
    }
  }
}

export interface TrafficSummary {
  network: {
    hierarchyNode: {
      apTotalTraffic: number
      switchTotalTraffic: number
    }
  }
}

export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    traffic: build.query<TrafficSummary, RequestPayload>({
      query: payload => ({
        document: gql`
          query TrafficSummary(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                apTotalTraffic: totalTraffic
                switchTotalTraffic
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload)
        }
      })
    }),
    incidents: build.query<IncidentSummary, RequestPayload>({
      query: payload => ({
        document: gql`
          query IncidentSummary(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput
          $code: [String]
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                apIncidentCount: incidentCount(
                  filter: {
                    code: $code
                    type: "apMac"
                }),
                switchIncidentCount: incidentCount(
                  filter: {
                    code: $code
                    type: "switchId"
                }),
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload),
          code: incidentsToggle({})
        }
      })
    }),
    utilization: build.query<UtilizationSummary, RequestPayload>({
      query: payload => ({
        document: gql`
          query UtilizationSummary(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                portCount
                totalPortCount
                avgPerAPClientCount
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload)
        }
      })
    })
  })
})

export const { useTrafficQuery, useIncidentsQuery, useUtilizationQuery } = api
