/* eslint-disable max-len */
import { gql } from 'graphql-request'

import {
  getFilterPayload,
  IncidentFilter,
  incidentSeverities,
  incidentCodes
} from '@acx-ui/analytics/utils'
import { dataApi } from '@acx-ui/store'

export type IncidentsBySeverityDataKey = keyof typeof incidentSeverities

export type DataResponse = {
  P1Count: number,
  P2Count: number,
  P3Count: number,
  P4Count: number
}
interface ApiResponse {
  network: {
    hierarchyNode: DataResponse
  }
}
export type SeverityData = Record<string, {
  incidentsCount: number
}>

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverityDashboardv2: build.query<
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
            $filter: FilterInput
          ){
            network(start: $start, end: $end, filter : $filter) {
              hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities).map(([name, { gt, lte }]) => `
              ${name}Count: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
              `).join('')}
              }
            }
          }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: ApiResponse) => {
        const data = response.network.hierarchyNode
        const severities: SeverityData = {}
        for (const severity in incidentSeverities) {
          severities[severity] = {
            incidentsCount: data[`${severity}Count` as keyof DataResponse] as number
          }
        }
        return severities
      },
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LISTS' }]
    })
  })
})

export const { useIncidentsBySeverityDashboardv2Query } = api
