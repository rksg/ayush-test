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

export type ImpactedCount = {
  impactedClientCount: (number | null)[]
}

export type DataResponse = {
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
interface ApiResponse {
  network: {
    hierarchyNode: DataResponse
  }
}
export type SeverityData = Record<string, {
  incidentsCount: number,
  impactedClients: ImpactedCount,
  connection: number,
  performance: number,
  infrastructure: number,
}>

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverityDashboard: build.query<
      SeverityData,
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
            $filter: FilterInput
          ){
            network(start: $start, end: $end, filter : $filter) {
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
          granularity: 'all',
          filter: payload?.filter
        }
      }),
      transformResponse: (response: ApiResponse) => {
        const data = response.network.hierarchyNode
        const severities: SeverityData = {}
        for (const severity in incidentSeverities) {
          severities[severity] = {
            incidentsCount: data[`${severity}Count` as keyof DataResponse] as number,
            impactedClients: data[`${severity}Impact` as keyof DataResponse] as ImpactedCount,
            infrastructure: data[`infrastructure${severity}` as keyof DataResponse] as number,
            performance: data[`performance${severity}` as keyof DataResponse] as number,
            connection: data[`connection${severity}` as keyof DataResponse] as number
          }
        }
        return severities
      },
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    })
  })
})

export const { useIncidentsBySeverityDashboardQuery } = api
