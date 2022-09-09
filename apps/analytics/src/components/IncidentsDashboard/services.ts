import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentSeverities,
  incidentCodes
} from '@acx-ui/analytics/utils'

export type IncidentsBySeverityDataKey = keyof typeof incidentSeverities

type ImpactedCount = {
  impactedClientCount: number[]
}

export type IncidentsDashboardData = {
  P1Count: number,
  P2Count: number,
  P3Count: number,
  P4Count: number,
  P1Impact: ImpactedCount,
  P2Impact: ImpactedCount,
  P3Impact: ImpactedCount,
  P4Impact: ImpactedCount,
}

interface HeaderResponse <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}

export const headerApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverityDashboard: build.query<
      IncidentsDashboardData,
      IncidentFilter
    >({
      query: (payload) => ({
        document: gql`
          query IncidentsDashboardWidget(
            $start: DateTime,
            $end: DateTime,
            $path: [HierarchyNodeInput],
            $code: [String],
            $granularity: String
          ){
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities).map(([name, { gt, lte }]) => `
              ${name}Count: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
              ${name}Impact: timeSeries(granularity: $granularity) {
              impactedClientCount: impactedClientCountBySeverity(
              filter: {severity:[{gt: ${gt}, lte: ${lte}}], code: $code})
              }  
              `).join('')}
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes,
          granularity: 'all'
        }
      }),
      transformResponse: (response: HeaderResponse<IncidentsDashboardData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityDashboardQuery } = headerApi

export type IncidentByCategory = {
  [Key in IncidentsBySeverityDataKey]: number
}

interface BarchartResponse <IncidentByCategory> {
  network: {
    hierarchyNode: IncidentByCategory
  }
}

export const barchartApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsByCategoryDashboard: build.query<
    IncidentByCategory,
      IncidentFilter
    >({
      query: (payload) => ({
        document: gql`
        query IncidentDashboardStackChartWidget(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $code: [String]
        ) {
          network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
            ${Object.entries(incidentSeverities).map(([name, { gt, lte }]) => `
              ${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
            `).join('')}
            }
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          code: payload.code
        }
      }),
      transformResponse: (response: BarchartResponse<IncidentByCategory>) => 
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsByCategoryDashboardQuery } = barchartApi