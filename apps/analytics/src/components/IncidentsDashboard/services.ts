/* eslint-disable max-len */
import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentSeverities,
  incidentCodes,
  categoryCodeMap
} from '@acx-ui/analytics/utils'

export type IncidentsBySeverityDataKey = keyof typeof incidentSeverities

type ImpactedCount = {
  impactedClientCount: (number | null)[]
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
  connectionP1: number,
  performanceP1: number,
  infrastructureP1: number,
  connectionP2: number,
  performanceP2: number,
  infrastructureP2: number,
  connectionP3: number,
  performanceP3: number,
  infrastructureP3: number,
  connectionP4: number,
  performanceP4: number,
  infrastructureP4: number,
}

interface HeaderResponse <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}

export const api = dataApi.injectEndpoints({
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
            $granularity: String,
            $connectionCodes: [String],
            $performanceCodes: [String],
            $infrastructureCodes: [String],
          ){
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities).map(([name, { gt, lte }]) => `
              ${name}Count: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
              ${name}Impact: timeSeries(granularity: $granularity) {
              impactedClientCount: impactedClientCountBySeverity(
              filter: {severity:[{gt: ${gt}, lte: ${lte}}], code: $code})
              }
              connection${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $connectionCodes})
              performance${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $performanceCodes})
              infrastructure${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $infrastructureCodes})
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
          connectionCodes: categoryCodeMap.connection.codes,
          performanceCodes: categoryCodeMap.performance.codes,
          infrastructureCodes: categoryCodeMap.infrastructure.codes,
          granularity: 'all'
        }
      }),
      transformResponse: (response: HeaderResponse<IncidentsDashboardData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityDashboardQuery } = api
