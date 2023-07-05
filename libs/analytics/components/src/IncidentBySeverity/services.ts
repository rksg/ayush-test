import { gql } from 'graphql-request'

import {
  getFilterPayload,
  IncidentFilter,
  incidentSeverities,
  incidentCodes
} from '@acx-ui/analytics/utils'
import { dataApi } from '@acx-ui/store'

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
export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverity: build.query<IncidentsBySeverityData, IncidentFilter>({
      query: (payload) => ({
        document: gql`
        query IncidentsBySeverityWidget(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $code: [String],
          $filter: FilterInput
        ) {
          network(start: $start, end: $end, filter : $filter) {
            hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities)
          .map(
            ([name, { gt, lte }]) => `
              ${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
            `
          )
          .join('')}
            }
          }
        }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          code: payload.code ?? incidentCodes,
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode,
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    })
  })
})

export const { useIncidentsBySeverityQuery } = api
