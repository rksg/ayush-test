import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentSeverities,
  incidentCodes,
  Incident
} from '@acx-ui/analytics/utils'

const incidentQueryProps = {
  incident: `
    severity
    startTime
    endTime
    code
    id
    impactedClientCount
  `
}

export type IncidentsBySeverityDataKey = keyof typeof incidentSeverities

export type IncidentsBySeverityData = {
  [Key in IncidentsBySeverityDataKey]: Pick<Incident, 
  'severity' | 
  'startTime' | 
  'endTime' | 
  'code' |
  'id' | 
  'impactedClientCount'>[]
}

interface Response <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverityDashboard: build.query<
      IncidentsBySeverityData,
      IncidentFilter
    >({
      query: (payload) => ({
        document: gql`
        query IncidentsDashboardWidget(
          $path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]
        ) {
          network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities).map(([name, { gt, lte }]) => `
              ${name}: incidents(
                filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code, includeMuted: false}
              ) {
                ${incidentQueryProps.incident}
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
          code: payload.code ?? incidentCodes
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityDashboardQuery } = api
