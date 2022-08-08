import { gql } from 'graphql-request'

import { dataApi }                        from '@acx-ui/analytics/services'
import { AnalyticsFilter, incidentCodes } from '@acx-ui/analytics/utils'

export type IncidentsBySeverityData = {
  P1: number
  P2: number
  P3: number
  P4: number
}

interface Response <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}
// move to lib/constants when required to be reused
const severities = {
  P1: { gt: 0.9, lte: 1 },
  P2: { gt: 0.75, lte: 0.9 },
  P3: { gt: 0.6, lte: 0.75 },
  P4: { gt: 0, lte: 0.6 }
}
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverity: build.query<
      IncidentsBySeverityData,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query IncidentsBySeverityWidget(
          $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]
        ) {
          network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
              ${Object.entries(severities).map(([name, { gt, lte }]) => `
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
          code: incidentCodes
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityQuery } = api
