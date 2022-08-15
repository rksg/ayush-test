import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  AnalyticsFilter,
  incidentSeverities,
  incidentCodes,
  IncidentCode
} from '@acx-ui/analytics/utils'

export type IncidentsBySeverityData = {
  P1: number
  P2: number
  P3: number
  P4: number
}
export type Filters = AnalyticsFilter & { code? : IncidentCode[] }
interface Response <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverity: build.query<
      IncidentsBySeverityData,
      Filters
    >({
      query: (payload) => ({
        document: gql`
        query IncidentsBySeverityWidget(
          $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]
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
          code: payload.code ?? incidentCodes
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityQuery } = api
